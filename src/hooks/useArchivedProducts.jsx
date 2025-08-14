// src/hooks/useArchivedProducts.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useArchivedProducts = (addNotification) => {
  const queryClient = useQueryClient();

  // Query to fetch all archived products
  const {
    data: archivedProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["archivedProducts"],
    queryFn: async () => {
      const { data, error } = await api.getArchivedProducts();
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Mutation to unarchive (restore) products
  const unarchiveMutation = useMutation({
    mutationFn: (productIds) =>
      api.supabase
        .from("products")
        .update({ status: "Available" })
        .in("id", productIds),
    onSuccess: (data, productIds) => {
      // Invalidate both archived and regular product queries to update all lists
      queryClient.invalidateQueries({ queryKey: ["archivedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      addNotification(
        `${productIds.length} product(s) successfully unarchived.`,
        "success"
      );
      addSystemNotification({
        id: `unarchive-${Date.now()}`,
        iconType: "unarchive",
        iconBg: "bg-green-100",
        title: "Products Restored",
        category: "System",
        description: `${productIds.length} product(s) were restored from the archive.`,
        createdAt: new Date().toISOString(),
        path: "/management",
      });
    },
    onError: (error) => {
      addNotification(`Error: ${error.message}`, "error");
    },
  });

  // Mutation to permanently delete products
  const deleteMutation = useMutation({
    mutationFn: (productIds) =>
      api.supabase.from("products").delete().in("id", productIds),
    onSuccess: (data, productIds) => {
      queryClient.invalidateQueries({ queryKey: ["archivedProducts"] });
      addNotification(
        `${productIds.length} product(s) permanently deleted.`,
        "success"
      );
      addSystemNotification({
        id: `delete-${Date.now()}`,
        iconType: "delete",
        iconBg: "bg-red-100",
        title: "Products Deleted",
        category: "System",
        description: `${productIds.length} product(s) were permanently deleted.`,
        createdAt: new Date().toISOString(),
        path: "/archived",
      });
    },
    onError: (error) => {
      addNotification(`Error: ${error.message}`, "error");
    },
  });

  return {
    archivedProducts,
    isLoading,
    isError,
    unarchiveProducts: unarchiveMutation.mutate,
    deleteProductsPermanently: deleteMutation.mutate,
  };
};
