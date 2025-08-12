// src/hooks/useArchivedProducts.jsx
import { useState, useEffect, useCallback } from "react";
import * as api from "@/services/api";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useArchivedProducts = (addNotification) => {
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArchivedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
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

  const unarchiveProduct = async (productId) => {
    const { error: updateError } = await api.updateProduct(productId, {
      status: "Available",
    });

    if (updateError) {
      addNotification(`Error: ${updateError.message}`, "error");
    } else {
      addNotification("Product successfully unarchived.", "success");
      addSystemNotification({
        id: `unarchive-${productId}-${Date.now()}`,
        iconType: "unarchive",
        iconBg: "bg-green-100",
        title: "Product Unarchived",
        category: "System",
        description: `A product was moved back to Available.`,
        createdAt: new Date().toISOString(),
        path: "/management",
      });
      fetchArchivedProducts(); // Refresh the list
    }
  };

  const deleteProductPermanently = async (productId) => {
    // In a real application, you should use a custom confirmation modal.
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product? This action cannot be undone."
      )
    ) {
      const { error: deleteError } = await api.deleteProduct(productId);

      if (deleteError) {
        addNotification(`Error: ${deleteError.message}`, "error");
      } else {
        addNotification("Product permanently deleted.", "success");
        addSystemNotification({
          id: `delete-${productId}-${Date.now()}`,
          iconType: "delete",
          iconBg: "bg-red-100",
          title: "Product Deleted",
          category: "System",
          description: `A product was permanently deleted.`,
          createdAt: new Date().toISOString(),
          path: "/archived",
        });
        fetchArchivedProducts(); // Refresh the list
      }
    }
  };

  return {
    archivedProducts,
    loading,
    error,
    fetchArchivedProducts,
    unarchiveProduct,
    deleteProductPermanently,
  };
};
