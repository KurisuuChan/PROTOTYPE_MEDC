// src/hooks/useArchivedProducts.jsx
import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useArchivedProducts = (addNotification) => {
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchArchivedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedItems([]); // Reset selection on fetch
    const { data, error: fetchError } = await api.getArchivedProducts();

    if (fetchError) {
      console.error("Error fetching archived products:", fetchError);
      setError(fetchError);
    } else {
      setArchivedProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArchivedProducts();
  }, [fetchArchivedProducts]);

  const unarchiveProducts = async (productIds) => {
    const { error: updateError } = await api.supabase
      .from("products")
      .update({ status: "Available" })
      .in("id", productIds);

    if (updateError) {
      addNotification(`Error: ${updateError.message}`, "error");
    } else {
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
      fetchArchivedProducts();
    }
  };

  const deleteProductsPermanently = async (productIds) => {
    const { error: deleteError } = await api.supabase
      .from("products")
      .delete()
      .in("id", productIds);

    if (deleteError) {
      addNotification(`Error: ${deleteError.message}`, "error");
    } else {
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
      fetchArchivedProducts();
    }
  };

  return {
    archivedProducts,
    loading,
    error,
    selectedItems,
    setSelectedItems,
    fetchArchivedProducts,
    unarchiveProducts,
    deleteProductsPermanently,
  };
};
