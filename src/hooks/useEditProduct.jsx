import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";

export const useEditProduct = (product, onSuccess) => {
  const [formData, setFormData] = useState(product);
  const { addNotification: showToast } = useNotification(); // Renamed to avoid conflict
  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const editProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      api.updateProduct(updatedProduct.id, updatedProduct),

    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueryData(["products"]);
      queryClient.setQueryData(["products"], (oldData) =>
        oldData.map((p) =>
          p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
        )
      );
      return { previousProducts };
    },

    onError: (err, updatedProduct, context) => {
      queryClient.setQueryData(["products"], context.previousProducts);
      showToast(`Error updating product: ${err.message}`, "error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onSuccess: (data, variables) => {
      showToast("Product updated successfully!", "success");
      if (product?.price !== variables.price) {
        // Use the new API function to add a notification to the database
        api.addNotification({
          type: "price_change",
          title: "Price Updated",
          description: `Price for ${variables.name} changed from ₱${product.price} to ₱${variables.price}.`,
          path: "/management",
        });
      }
      onSuccess();
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = { ...formData };
    updateData.expireDate = updateData.expireDate || null;
    delete updateData.product_variants;
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
