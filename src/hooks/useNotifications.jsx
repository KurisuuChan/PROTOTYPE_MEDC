import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase/client";
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

/**
 * Generates system notifications from localStorage.
 */
const generateSystemNotifications = (readIds) => {
  const systemNotifications = getSystemNotifications();
  return systemNotifications.map((s) => ({
    ...s,
    read: readIds.includes(s.id),
    createdAt: new Date(s.createdAt),
  }));
};

/**
 * Generates expiry-related notifications for a single product.
 */
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

/**
 * Generates stock-related notifications for a single product.
 */
const generateStockNotifications = (product, settings, readIds, timestamps) => {
  const notifications = [];
  const { lowStockThreshold } = settings;
  const lowStockId = `low-${product.id}`;
  const noStockId = `no-stock-${product.id}`;
  let wasUpdated = false;

  // When stock is replenished, we clear the timestamp.
  // This makes the next stock alert a new, unique event.
  if (product.quantity > lowStockThreshold && timestamps[lowStockId]) {
    delete timestamps[lowStockId];
    wasUpdated = true;
  }
  if (product.quantity > 0 && timestamps[noStockId]) {
    delete timestamps[noStockId];
    wasUpdated = true;
  }

  // Generate notifications
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

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
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
    const dismissedIds = getDismissedNotificationIds();
    const settings = getNotificationSettings();
    const lowStockTimestamps = getLowStockTimestamps();
    let timestampsWereUpdated = false;

    let generated = generateSystemNotifications(readIds);

    products.forEach((product) => {
      generated.push(
        ...generateExpiryNotifications(product, settings, readIds)
      );

      const stockResult = generateStockNotifications(
        product,
        settings,
        readIds,
        lowStockTimestamps
      );
      generated.push(...stockResult.notifications);
      if (stockResult.wasUpdated) {
        timestampsWereUpdated = true;
      }
    });

    if (timestampsWereUpdated) {
      setLowStockTimestamps(lowStockTimestamps);
    }

    generated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAllNotifications(generated);
    setNotifications(generated.filter((n) => !dismissedIds.includes(n.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("products-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        fetchNotifications
      )
      .subscribe();
    window.addEventListener("storage", fetchNotifications);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("storage", fetchNotifications);
    };
  }, [fetchNotifications]);

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
        notifications.find(
          (n) => n.id === notificationId && n.category === "System"
        )
      ) {
        removeSystemNotification(notificationId);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
    [notifications]
  );

  const markAsRead = useCallback((notificationId) => {
    const currentReadIds = getReadNotificationIds();
    if (!currentReadIds.includes(notificationId)) {
      setReadNotificationIds([...currentReadIds, notificationId]);
      // Update state locally for immediate feedback
      const updater = (n) =>
        n.id === notificationId ? { ...n, read: true } : n;
      setNotifications((prev) => prev.map(updater));
      setAllNotifications((prev) => prev.map(updater));
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const readIds = getReadNotificationIds();
    setReadNotificationIds([...new Set([...readIds, ...allIds])]);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  return {
    notifications,
    allNotifications,
    loading,
    unreadCount,
    categories,
    categoryCounts,
    groupedByDate,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismiss,
  };
}
