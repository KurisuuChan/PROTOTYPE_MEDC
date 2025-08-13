// src/hooks/useAddProduct.jsx
import { useState, useCallback } from "react";
import * as api from "@/services/api";
import { useNotification } from "@/hooks/useNotifications";

const initialFormState = {
  name: "",
  category: "Pain Relief",
  quantity: "",
  price: "",
  cost_price: "", // Added cost_price
  expireDate: "",
  productType: "Medicine",
  description: "",
};

const initialVariantState = [
  {
    id: `variant-${Date.now()}`, // Unique ID for the key prop
    unit_type: "piece",
    unit_price: "",
    units_per_variant: 1,
    is_default: true,
  },
];

export const useAddProduct = (onSuccess) => {
  const [formData, setFormData] = useState(initialFormState);
  const [variants, setVariants] = useState(initialVariantState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setVariants(initialVariantState);
    setError("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (id, field, value) => {
    let newVariants = variants.map((v) => {
      if (v.id === id) {
        return { ...v, [field]: value };
      }
      return v;
    });

    // If a new default is set, ensure all others are not default
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
        id: `variant-${Date.now()}`, // Ensure new variants get a unique ID
        unit_type: "piece",
        unit_price: "",
        units_per_variant: 1,
        is_default: false,
      },
    ]);
  };

  const removeVariant = (id) => {
    if (variants.length <= 1) return; // Prevent removing the last variant
    const newVariants = variants.filter((v) => v.id !== id);
    // If the removed variant was the default, make the first one the new default
    if (!newVariants.some((v) => v.is_default)) {
      newVariants[0].is_default = true;
    }
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (variants.some((v) => !v.unit_price || v.unit_price <= 0)) {
        throw new Error("All variants must have a valid, positive price.");
      }

      const { data: lastProduct, error: fetchError } = await api.supabase
        .from("products")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      const nextId = lastProduct ? lastProduct.id + 1 : 1;
      const today = new Date();
      const datePart = `${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(today.getDate()).padStart(2, "0")}${today.getFullYear()}`;
      const typePart = formData.productType === "Medicine" ? "1" : "0";
      const newMedicineId = `${datePart}${typePart}${nextId}`;

      const defaultVariantPrice =
        variants.find((v) => v.is_default)?.unit_price ||
        variants[0].unit_price;
      const numericQuantity = parseInt(formData.quantity, 10) || 0;

      const productToInsert = {
        ...formData,
        quantity: numericQuantity,
        price: parseFloat(defaultVariantPrice) || 0,
        cost_price: parseFloat(formData.cost_price) || 0, // Added cost_price
        medicineId: newMedicineId,
        status: numericQuantity > 0 ? "Available" : "Unavailable",
      };

      const { data: insertedProduct, error: productError } = await api.supabase
        .from("products")
        .insert([productToInsert])
        .select()
        .single();
      if (productError) throw productError;

      const variantsToInsert = variants.map((v) => ({
        product_id: insertedProduct.id,
        unit_type: v.unit_type,
        unit_price: parseFloat(v.unit_price) || 0,
        units_per_variant: parseInt(v.units_per_variant, 10) || 1,
        is_default: v.is_default,
      }));
      const { error: variantsError } = await api.supabase
        .from("product_variants")
        .insert(variantsToInsert);
      if (variantsError) throw variantsError;

      onSuccess();
    } catch (err) {
      const errorMessage = `Failed to add product: ${err.message}`;
      setError(errorMessage);
      addNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    variants,
    loading,
    error,
    handleChange,
    handleVariantChange,
    addVariant,
    removeVariant,
    handleSubmit,
    resetForm,
  };
};
