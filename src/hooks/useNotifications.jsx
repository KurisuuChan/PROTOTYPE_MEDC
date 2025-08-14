// src/hooks/useNotifications.jsx
import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { supabase } from "@/supabase/client";
import { NotificationContext } from "@/context/NotificationContext";
import {
  getDismissedNotificationIds,
  getNotificationSettings,
  getSystemNotifications,
  removeSystemNotification,
  setDismissedNotificationIds,
  getLowStockTimestamps,
  setLowStockTimestamps,
  // --- MODIFIED IMPORTS ---
  getReadTimestamps,
  updateReadTimestamp,
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

// --- HELPER FUNCTION TO DETERMINE READ STATUS ---
const isNotificationRead = (id, createdAt, readTimestamps) => {
  const lastReadTime = readTimestamps[id];
  if (!lastReadTime) return false;
  return new Date(lastReadTime) >= new Date(createdAt);
};

// Helper Functions
const generateSystemNotifications = (readTimestamps) => {
  const systemNotifications = getSystemNotifications();
  return systemNotifications.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    read: isNotificationRead(s.id, s.createdAt, readTimestamps),
  }));
};

const generateExpiryNotifications = (product, settings, readTimestamps) => {
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
      path: `/management?highlight=${product.id}`,
      createdAt: expiryDate,
      read: isNotificationRead(expiredId, expiryDate, readTimestamps),
    });
  } else if (settings.enableExpiringSoon) {
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const expSoonId = `exp-soon-${product.id}`;
    const createdAt = new Date();

    if (diffDays > 0 && diffDays <= Number(settings.expiringSoonDays)) {
      notifications.push({
        id: expSoonId,
        iconType: "expiringSoon",
        iconBg: "bg-orange-100",
        title: "Expiring Soon",
        category: "Expiring Soon",
        description: `${product.name} expires in ${diffDays} day(s).`,
        path: `/management?highlight=${product.id}`,
        createdAt,
        read: isNotificationRead(expSoonId, createdAt, readTimestamps),
      });
    }
  }
  return notifications;
};

const generateStockNotifications = (
  product,
  settings,
  readTimestamps,
  timestamps
) => {
  const notifications = [];
  const { lowStockThreshold } = settings;
  const lowStockId = `low-${product.id}`;
  const noStockId = `no-stock-${product.id}`;

  if (product.quantity <= lowStockThreshold && product.quantity > 0) {
    if (!timestamps[lowStockId]) {
      timestamps[lowStockId] = new Date().toISOString();
    }
    const createdAt = new Date(timestamps[lowStockId]);
    notifications.push({
      id: lowStockId,
      iconType: "lowStock",
      iconBg: "bg-yellow-100",
      title: "Low Stock",
      category: "Low Stock",
      description: `${product.name} has only ${product.quantity} items left.`,
      path: `/management?highlight=${product.id}`,
      createdAt,
      read: isNotificationRead(lowStockId, createdAt, readTimestamps),
    });
  } else if (product.quantity === 0) {
    if (!timestamps[noStockId]) {
      timestamps[noStockId] = new Date().toISOString();
    }
    const createdAt = new Date(timestamps[noStockId]);
    notifications.push({
      id: noStockId,
      iconType: "noStock",
      iconBg: "bg-red-100",
      title: "Out of Stock",
      category: "No Stock",
      description: `${product.name} is out of stock.`,
      path: `/management?highlight=${product.id}`,
      createdAt,
      read: isNotificationRead(noStockId, createdAt, readTimestamps),
    });
  }
  return notifications;
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

    const readTimestamps = getReadTimestamps();
    const settings = getNotificationSettings();
    const lowStockTimestamps = getLowStockTimestamps();

    let generated = generateSystemNotifications(readTimestamps);

    products.forEach((product) => {
      const expiryNotifs = generateExpiryNotifications(
        product,
        settings,
        readTimestamps
      );
      const stockNotifs = generateStockNotifications(
        product,
        settings,
        readTimestamps,
        lowStockTimestamps
      );
      generated.push(...expiryNotifs, ...stockNotifs);
    });

    setLowStockTimestamps(lowStockTimestamps);

    generated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAllNotifications(generated);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndSetInitialNotifications();
    const handleRealtimeChange = () => fetchAndSetInitialNotifications();

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

  const markAsRead = useCallback(
    (notificationId) => {
      const notification = allNotifications.find(
        (n) => n.id === notificationId
      );
      if (notification && !notification.read) {
        updateReadTimestamp(notificationId);
        setAllNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    },
    [allNotifications]
  );

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
