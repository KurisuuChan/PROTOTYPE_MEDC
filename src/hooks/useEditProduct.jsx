import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";

export const useEditProduct = (product, onSuccess) => {
  const [formData, setFormData] = useState(product);
  const [variants, setVariants] = useState(product?.product_variants || []);
  const { addNotification: showToast } = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData(product);
    setVariants(product?.product_variants || []);
  }, [product]);

  const editProductMutation = useMutation({
    mutationFn: async ({ productData, variantsData }) => {
      // 1. Update the main product details
      const { data: updatedProd, error: productError } =
        await api.updateProduct(productData.id, productData);
      if (productError) throw productError;

      // 2. Delete existing variants for this product
      // A simple approach is to delete and re-insert.
      const { error: deleteError } = await api.supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productData.id);
      if (deleteError) throw deleteError;

      // 3. Insert the updated variants
      if (variantsData && variantsData.length > 0) {
        const variantsToInsert = variantsData.map((v) => ({
          ...v,
          product_id: productData.id,
        }));
        const { error: variantsError } = await api.supabase
          .from("product_variants")
          .insert(variantsToInsert);
        if (variantsError) throw variantsError;
      }

      return updatedProd;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product updated successfully!", "success");
      if (product?.price !== variables.productData.price) {
        api.addNotification({
          type: "price_change",
          title: "Price Updated",
          description: `Price for ${variables.productData.name} changed from ₱${product.price} to ₱${variables.productData.price}.`,
          path: "/management",
        });
      }
      onSuccess();
    },
    onError: (err) => {
      showToast(`Error updating product: ${err.message}`, "error");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (id, field, value) => {
    let newVariants = variants.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    );
    if (field === "is_default" && value === true) {
      newVariants = newVariants.map((v) =>
        v.id === id ? v : { ...v, is_default: false }
      );
    }
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `variant-${Date.now()}`,
        unit_type: "piece",
        unit_price: "",
        units_per_variant: 1,
        is_default: prev.length === 0,
      },
    ]);
  };

  const removeVariant = (id) => {
    if (variants.length <= 1) return;
    const newVariants = variants.filter((v) => v.id !== id);
    if (!newVariants.some((v) => v.is_default)) {
      newVariants[0].is_default = true;
    }
    setVariants(newVariants);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const defaultVariantPrice =
      variants.find((v) => v.is_default)?.unit_price ||
      variants[0]?.unit_price ||
      0;

    const productData = {
      ...formData,
      price: parseFloat(defaultVariantPrice) || 0,
      quantity: parseInt(formData.quantity, 10) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      expireDate: formData.expireDate || null,
    };
    delete productData.product_variants; // Clean up the object

    const variantsData = variants.map(({ id, ...rest }) => rest);

    editProductMutation.mutate({ productData, variantsData });
  };

  return {
    formData,
    variants,
    isLoading: editProductMutation.isPending,
    error: editProductMutation.error?.message,
    handleChange,
    handleVariantChange,
    addVariant,
    removeVariant,
    handleSubmit,
  };
};
