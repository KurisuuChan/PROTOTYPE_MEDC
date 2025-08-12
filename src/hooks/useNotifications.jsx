import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase/client";
import {
  getDismissedNotificationIds,
  getLowStockTimestamps,
  getNotificationSettings,
  getReadNotificationIds,
  getSystemNotifications,
  removeSystemNotification,
  setDismissedNotificationIds,
  setLowStockTimestamps,
  setReadNotificationIds,
} from "@/utils/notificationStorage";

/**
 * useNotifications centralizes fetching, generating and managing notifications
 * (mark as read, dismiss, subscribe to changes)
 */
export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
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
    const lowStockTimestamps = getLowStockTimestamps();
    const settings = getNotificationSettings();
    let newTimestamps = { ...lowStockTimestamps };
    let timestampsUpdated = false;

    const lowStockThreshold = Number(settings.lowStockThreshold) || 0;
    const today = new Date();
    let generated = [];

    const buildSystemNotifications = (items, readIdsLocal) =>
      items.map((s) => ({
        id: s.id,
        iconType: s.iconType || "bell",
        iconBg: s.iconBg || "bg-gray-100",
        title: s.title,
        category: s.category || "System",
        description: s.description,
        read: readIdsLocal.includes(s.id),
        path: s.path || "/",
        createdAt: new Date(s.createdAt),
      }));

    // Include stored system notifications first
    const systemNotifications = getSystemNotifications();
    generated.push(...buildSystemNotifications(systemNotifications, readIds));

    const pushExpiryNotifications = (product) => {
      const expiredId = `expired-${product.id}`;
      const expiryDate = new Date(product.expireDate);
      if (expiryDate < today) {
        generated.push({
          id: expiredId,
          iconType: "expired",
          iconBg: "bg-red-100",
          title: "Expired Medicine Alert",
          category: "Expired",
          description: `${product.name} (ID: ${product.id}) has expired.`,
          read: readIds.includes(expiredId),
          path: `/management?highlight=${product.id}`,
          createdAt: expiryDate,
        });
      }

      if (settings.enableExpiringSoon && product.expireDate) {
        const diffMs = expiryDate - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= Number(settings.expiringSoonDays)) {
          const expSoonId = `exp-soon-${product.id}`;
          generated.push({
            id: expSoonId,
            iconType: "expiringSoon",
            iconBg: "bg-orange-100",
            title: "Expiring Soon",
            category: "Expiring Soon",
            description: `${product.name} expires in ${diffDays} day(s).`,
            read: readIds.includes(expSoonId),
            path: `/management?highlight=${product.id}`,
            createdAt: expiryDate,
          });
        }
      }
    };

    const buildStockNotifications = (
      product,
      lowThreshold,
      readIdsLocal,
      timestamps
    ) => {
      const notes = [];
      let timestampsChanged = false;
      const baseLowStockId = `low-${product.id}`;

      // Clear episodes when stock recovers or hits zero
      if (product.quantity > lowThreshold && timestamps[baseLowStockId]) {
        delete timestamps[baseLowStockId];
        timestampsChanged = true;
      }
      if (product.quantity === 0 && timestamps[baseLowStockId]) {
        delete timestamps[baseLowStockId];
        timestampsChanged = true;
      }

      // Low stock episode tracking
      if (product.quantity <= lowThreshold && product.quantity > 0) {
        let timestamp = timestamps[baseLowStockId];
        if (!timestamp) {
          timestamp = new Date().toISOString();
          timestamps[baseLowStockId] = timestamp;
          timestampsChanged = true;
        }
        const lowStockId = `${baseLowStockId}-${timestamp}`;
        notes.push({
          id: lowStockId,
          iconType: "lowStock",
          iconBg: "bg-yellow-100",
          title: "Low Stock Warning",
          category: "Low Stock",
          description: `${product.name} has only ${product.quantity} items left.`,
          read: readIdsLocal.includes(lowStockId),
          path: `/management?highlight=${product.id}`,
          createdAt: new Date(timestamp),
        });
      }

      // Out of stock
      if (product.quantity === 0) {
        const noStockId = `no-stock-${product.id}`;
        notes.push({
          id: noStockId,
          iconType: "noStock",
          iconBg: "bg-red-100",
          title: "Out of Stock",
          category: "No Stock",
          description: `${product.name} is out of stock.`,
          read: readIdsLocal.includes(noStockId),
          path: `/management?highlight=${product.id}`,
          createdAt: new Date(),
        });
      }

      return {
        notifications: notes,
        updatedTimestamps: timestamps,
        timestampsChanged,
      };
    };

    products.forEach((product) => {
      const {
        notifications: stockNotes,
        updatedTimestamps,
        timestampsChanged,
      } = buildStockNotifications(
        product,
        lowStockThreshold,
        readIds,
        newTimestamps
      );
      newTimestamps = updatedTimestamps;
      if (timestampsChanged) timestampsUpdated = true;
      generated.push(...stockNotes);
      pushExpiryNotifications(product);
    });

    if (timestampsUpdated) {
      setLowStockTimestamps(newTimestamps);
    }

    generated = generated.filter((n) => !dismissedIds.includes(n.id));
    generated.sort((a, b) => b.createdAt - a.createdAt);

    setNotifications(generated);
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

    const handleStorageChange = () => {
      fetchNotifications();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("storage", handleStorageChange);
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
    return notifications.reduce(
      (acc, n) => {
        acc.All += 1;
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      },
      { All: 0 }
    );
  }, [notifications]);

  const markAsRead = useCallback(
    (notificationId) => {
      const readIds = getReadNotificationIds();
      if (!readIds.includes(notificationId)) {
        setReadNotificationIds([...readIds, notificationId]);
      }
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      const target = updated.find((x) => x.id === notificationId);
      if (target && target.category === "System") {
        // Auto-dismiss system notifications after marking as read
        dismiss(notificationId);
      }
    },
    [notifications, dismiss]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const readIds = getReadNotificationIds();
    const newReadIds = [...new Set([...readIds, ...allIds])];
    setReadNotificationIds(newReadIds);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));

    // Dismiss all system notifications and remove from storage
    const systemOnly = notifications.filter((n) => n.category === "System");
    const dismissed = getDismissedNotificationIds();
    const toDismiss = systemOnly.map((n) => n.id);
    setDismissedNotificationIds([...new Set([...dismissed, ...toDismiss])]);
    toDismiss.forEach((id) => removeSystemNotification(id));
  }, [notifications]);

  const dismiss = useCallback(
    (notificationId) => {
      const dismissed = getDismissedNotificationIds();
      setDismissedNotificationIds([...new Set([...dismissed, notificationId])]);
      const target = notifications.find((n) => n.id === notificationId);
      if (target && target.category === "System") {
        removeSystemNotification(notificationId);
      }
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    },
    [notifications]
  );

  return {
    notifications,
    loading,
    unreadCount,
    categories,
    categoryCounts,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismiss,
  };
}
