import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useEditProduct = (product, onSuccess) => {
  const [formData, setFormData] = useState(product);
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const editProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      api.updateProduct(updatedProduct.id, updatedProduct),

    // This is the core of the optimistic update
    onMutate: async (updatedProduct) => {
      // 1. Cancel any ongoing refetches for the 'products' query
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // 2. Snapshot the previous state of the products list
      const previousProducts = queryClient.getQueryData(["products"]);

      // 3. Optimistically update the cache with the new data
      queryClient.setQueryData(["products"], (oldData) =>
        oldData.map((p) =>
          p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
        )
      );

      // 4. Return the snapshot so we can roll back on error
      return { previousProducts };
    },

    // If the mutation fails, roll back to the previous state
    onError: (err, updatedProduct, context) => {
      queryClient.setQueryData(["products"], context.previousProducts);
      addNotification(`Error updating product: ${err.message}`, "error");
    },

    // After the mutation succeeds or fails, always refetch the data to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onSuccess: (data, variables) => {
      addNotification("Product updated successfully!", "success");
      // Check if the price changed and create a system notification
      if (product?.price !== variables.price) {
        addSystemNotification({
          id: `price-${variables.id}-${Date.now()}`,
          iconType: "price",
          iconBg: "bg-blue-100",
          title: "Price Updated",
          category: "System",
          description: `Price for ${variables.name} changed from ₱${product.price} to ₱${variables.price}.`,
          createdAt: new Date().toISOString(),
          path: "/management",
        });
      }
      onSuccess(); // Close the modal
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = { ...formData };

    // Ensure expireDate is null if it's an empty string to prevent database errors
    updateData.expireDate = updateData.expireDate || null;

    delete updateData.product_variants; // This field should not be in the update payload
    editProductMutation.mutate(updateData);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: editProductMutation.isPending,
    error: editProductMutation.error?.message,
  };
};
