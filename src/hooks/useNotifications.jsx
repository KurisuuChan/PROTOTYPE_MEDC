// src/hooks/useNotifications.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import { useEffect, useContext, useMemo } from "react";
import { NotificationContext } from "@/context/NotificationContext";

export function useNotificationHistory() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: (notificationId) =>
      supabase.from("notifications").delete().eq("id", notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const categories = useMemo(
    () => ["All", "low_stock", "no_stock", "system"],
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = notifications.reduce((acc, n) => {
      // --- FIX: Refactored nested ternary into a clearer switch statement ---
      let key;
      switch (n.type) {
        case "low_stock":
          key = "low_stock";
          break;
        case "no_stock":
          key = "no_stock";
          break;
        default:
          key = "system";
          break;
      }
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    counts.All = notifications.length;
    return counts;
  }, [notifications]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    notifications.forEach((n) => {
      const dateKey = new Date(n.created_at).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(n);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [notifications]);

  return {
    notifications,
    loading: isLoading,
    unreadCount,
    categories,
    categoryCounts,
    groupedByDate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    dismiss: dismissNotificationMutation.mutate,
  };
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
