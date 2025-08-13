// src/hooks/useNotifications.jsx
import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { supabase } from "@/supabase/client";
import { NotificationContext } from "@/context/NotificationContext";
import {
  getDismissedNotificationIds,
  getNotificationSettings,
  getReadNotificationIds,
  getSystemNotifications,
  removeSystemNotification,
  setDismissedNotificationIds,
  setReadNotificationIds,
  getLowStockTimestamps,
  setLowStockTimestamps,
} from "@/utils/notificationStorage";

// HOOK 1: For Showing UI Toasts (Pop-up Messages)
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// HOOK 2: For Managing the Notification History (Bell Icon)

// Helper Functions
const generateSystemNotifications = (readIds) => {
  const systemNotifications = getSystemNotifications();
  return systemNotifications.map((s) => ({
    ...s,
    read: readIds.includes(s.id),
    createdAt: new Date(s.createdAt),
  }));
};

const generateExpiryNotifications = (product, settings, readIds) => {
  if (!product.expireDate) return [];
  const notifications = [];
  const today = new Date();
  const expiryDate = new Date(product.expireDate);
  const expiredId = `expired-${product.id}`;
  if (expiryDate < today) {
    notifications.push({
      id: expiredId,
      iconType: "expired",
      iconBg: "bg-red-100",
      title: "Expired Medicine",
      category: "Expired",
      description: `${product.name} has expired.`,
      read: readIds.includes(expiredId),
      path: `/management?highlight=${product.id}`,
      createdAt: expiryDate,
    });
  } else if (settings.enableExpiringSoon) {
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const expSoonId = `exp-soon-${product.id}`;
    if (diffDays > 0 && diffDays <= Number(settings.expiringSoonDays)) {
      notifications.push({
        id: expSoonId,
        iconType: "expiringSoon",
        iconBg: "bg-orange-100",
        title: "Expiring Soon",
        category: "Expiring Soon",
        description: `${product.name} expires in ${diffDays} day(s).`,
        read: readIds.includes(expSoonId),
        path: `/management?highlight=${product.id}`,
        createdAt: new Date(),
      });
    }
  }
  return notifications;
};

const generateStockNotifications = (product, settings, readIds, timestamps) => {
  const notifications = [];
  const { lowStockThreshold } = settings;
  const lowStockId = `low-${product.id}`;
  const noStockId = `no-stock-${product.id}`;
  let wasUpdated = false;

  if (product.quantity > lowStockThreshold && timestamps[lowStockId]) {
    delete timestamps[lowStockId];
    wasUpdated = true;
  }
  if (product.quantity > 0 && timestamps[noStockId]) {
    delete timestamps[noStockId];
    wasUpdated = true;
  }

  if (product.quantity <= lowStockThreshold && product.quantity > 0) {
    if (!timestamps[lowStockId]) {
      timestamps[lowStockId] = new Date().toISOString();
      wasUpdated = true;
    }
    notifications.push({
      id: lowStockId,
      iconType: "lowStock",
      iconBg: "bg-yellow-100",
      title: "Low Stock",
      category: "Low Stock",
      description: `${product.name} has only ${product.quantity} items left.`,
      read: readIds.includes(lowStockId),
      path: `/management?highlight=${product.id}`,
      createdAt: new Date(timestamps[lowStockId]),
    });
  } else if (product.quantity === 0) {
    if (!timestamps[noStockId]) {
      timestamps[noStockId] = new Date().toISOString();
      wasUpdated = true;
    }
    notifications.push({
      id: noStockId,
      iconType: "noStock",
      iconBg: "bg-red-100",
      title: "Out of Stock",
      category: "No Stock",
      description: `${product.name} is out of stock.`,
      read: readIds.includes(noStockId),
      path: `/management?highlight=${product.id}`,
      createdAt: new Date(timestamps[noStockId]),
    });
  }
  return { notifications, wasUpdated };
};

export function useNotificationHistory() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAndSetInitialNotifications = useCallback(async () => {
    setLoading(true);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, quantity, expireDate, status")
      .neq("status", "Archived");

    if (error) {
      console.error("Error fetching products for notifications:", error);
      setLoading(false);
      return;
    }

    const readIds = getReadNotificationIds();
    let generated = generateSystemNotifications(readIds);
    const settings = getNotificationSettings();
    const lowStockTimestamps = getLowStockTimestamps();
    let timestampsWereUpdated = false;

    products.forEach((product) => {
      const expiryNotifs = generateExpiryNotifications(
        product,
        settings,
        readIds
      );
      const stockResult = generateStockNotifications(
        product,
        settings,
        readIds,
        lowStockTimestamps
      );
      generated.push(...expiryNotifs, ...stockResult.notifications);
      if (stockResult.wasUpdated) timestampsWereUpdated = true;
    });

    if (timestampsWereUpdated) setLowStockTimestamps(lowStockTimestamps);

    generated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAllNotifications(generated);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndSetInitialNotifications();

    const handleRealtimeChange = () => {
      // Removed unused 'payload' parameter
      fetchAndSetInitialNotifications();
    };

    const channel = supabase
      .channel("products-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        handleRealtimeChange
      )
      .subscribe();

    window.addEventListener("storage", fetchAndSetInitialNotifications);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("storage", fetchAndSetInitialNotifications);
    };
  }, [fetchAndSetInitialNotifications]);

  const notifications = useMemo(() => {
    const dismissedIds = getDismissedNotificationIds();
    return allNotifications.filter((n) => !dismissedIds.includes(n.id));
  }, [allNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const categories = useMemo(
    () => [
      "All",
      "Low Stock",
      "No Stock",
      "Expired",
      "Expiring Soon",
      "System",
    ],
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {});
    counts.All = notifications.length;
    return counts;
  }, [notifications]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    allNotifications.forEach((n) => {
      const dateKey = new Date(n.createdAt).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(n);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [allNotifications]);

  const dismiss = useCallback(
    (notificationId) => {
      const dismissed = getDismissedNotificationIds();
      setDismissedNotificationIds([...new Set([...dismissed, notificationId])]);
      if (
        allNotifications.find(
          (n) => n.id === notificationId && n.category === "System"
        )
      ) {
        removeSystemNotification(notificationId);
      }
    },
    [allNotifications]
  );

  const markAsRead = useCallback((notificationId) => {
    const currentReadIds = getReadNotificationIds();
    if (!currentReadIds.includes(notificationId)) {
      setReadNotificationIds([...currentReadIds, notificationId]);
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    }
  }, []);

  return {
    notifications,
    allNotifications,
    loading,
    unreadCount,
    categories,
    categoryCounts,
    groupedByDate,
    refresh: fetchAndSetInitialNotifications,
    markAsRead,
    dismiss,
  };
}
