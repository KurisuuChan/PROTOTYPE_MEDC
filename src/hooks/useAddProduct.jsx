import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";

const initialFormState = {
  name: "",
  category: "Pain Relief",
  quantity: "",
  price: "",
  cost_price: "",
  expireDate: "",
  productType: "Medicine",
  description: "",
  supplier: "", // <-- ADDED THIS LINE
};

const initialVariantState = [
  {
    id: `variant-${Date.now()}`,
    unit_type: "piece",
    unit_price: "",
    units_per_variant: 1,
    is_default: true,
  },
];

export const useAddProduct = (onSuccess) => {
  const [formData, setFormData] = useState(initialFormState);
  const [variants, setVariants] = useState(initialVariantState);
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setVariants(initialVariantState);
  }, []);

  const addProductMutation = useMutation({
    mutationFn: async (newProductData) => {
      const { product, variants } = newProductData;

      const { data: insertedProduct, error: productError } = await api.supabase
        .from("products")
        .insert([product])
        .select()
        .single();
      if (productError) throw productError;

      if (variants && variants.length > 0) {
        const variantsToInsert = variants.map((v) => ({
          ...v,
          product_id: insertedProduct.id,
        }));
        const { error: variantsError } = await api.supabase
          .from("product_variants")
          .insert(variantsToInsert);
        if (variantsError) throw variantsError;
      }

      return insertedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      addNotification("Product added successfully!", "success");
      onSuccess();
    },
    onError: (error) => {
      addNotification(`Failed to add product: ${error.message}`, "error");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.some((v) => !v.unit_price || v.unit_price <= 0)) {
      addNotification(
        "All variants must have a valid, positive price.",
        "error"
      );
      return;
    }

    const { data: lastProduct } = await api.supabase
      .from("products")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();
    const nextId = lastProduct ? lastProduct.id + 1 : 1;
    const today = new Date();
    const datePart = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate()
    ).padStart(2, "0")}${today.getFullYear()}`;
    const typePart = formData.productType === "Medicine" ? "1" : "0";
    const newMedicineId = `${datePart}${typePart}${nextId}`;
    const defaultVariantPrice =
      variants.find((v) => v.is_default)?.unit_price || variants[0].unit_price;

    const productToInsert = {
      ...formData,
      quantity: parseInt(formData.quantity, 10) || 0,
      price: parseFloat(defaultVariantPrice) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      expireDate: formData.expireDate || null,
      medicineId: newMedicineId,
      status:
        (parseInt(formData.quantity, 10) || 0) > 0
          ? "Available"
          : "Unavailable",
    };

    const variantsToInsert = variants.map(({ id, ...rest }) => rest);

    addProductMutation.mutate({
      product: productToInsert,
      variants: variantsToInsert,
    });
  };

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
        is_default: false,
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

  return {
    formData,
    variants,
    loading: addProductMutation.isPending,
    error: addProductMutation.error?.message,
    handleChange,
    handleVariantChange,
    addVariant,
    removeVariant,
    handleSubmit,
    resetForm,
  };
};
