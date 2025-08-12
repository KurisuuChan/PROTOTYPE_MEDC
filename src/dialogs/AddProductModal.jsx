import React, { useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "@/supabase/client";
import { PlusCircle, X, Plus, Trash2 } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";

const productCategories = [
  "Pain Relief",
  "Allergy & Sinus",
  "Cold & Flu",
  "Digestive Health",
  "Vitamins & Supplements",
  "First Aid",
  "Skin Care",
  "Personal Care",
  "Prescription",
  "Other",
];

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: productCategories[0], // Default to the first category
    quantity: "",
    price: "",
    expireDate: "",
    productType: "Medicine",
    description: "",
  });

  const [variants, setVariants] = useState([
    {
      unit_type: "piece",
      unit_price: "",
      units_per_variant: 1,
      is_default: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // If changing is_default, update other variants
    if (field === "is_default" && value === true) {
      newVariants.forEach((variant, i) => {
        if (i !== index) variant.is_default = false;
      });
    }

    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        unit_type: "piece",
        unit_price: "",
        units_per_variant: 1,
        is_default: false,
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      // Ensure at least one variant is default
      if (!newVariants.some((v) => v.is_default)) {
        newVariants[0].is_default = true;
      }
      setVariants(newVariants);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate variants
      if (variants.some((v) => !v.unit_price || v.unit_price <= 0)) {
        throw new Error("All variants must have valid prices");
      }

      const { data: lastProduct, error: fetchError } = await supabase
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
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const year = today.getFullYear();
      const datePart = `${month}${day}${year}`;
      const typePart = formData.productType === "Medicine" ? "1" : "0";
      const newMedicineId = `${datePart}${typePart}${nextId}`;

      const numericQuantity = parseInt(formData.quantity, 10) || 0;
      const defaultVariantPrice =
        variants.find((v) => v.is_default)?.unit_price ??
        variants[0].unit_price;
      const numericPrice = parseFloat(defaultVariantPrice) || 0;
      const computedStatus = numericQuantity > 0 ? "Available" : "Unavailable";

      const productToInsert = {
        ...formData,
        quantity: numericQuantity,
        price: numericPrice,
        medicineId: newMedicineId,
        status: computedStatus,
      };

      const { data: insertedProduct, error: insertError } = await supabase
        .from("products")
        .insert([productToInsert])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Insert variants
      const variantsToInsert = variants.map((variant) => ({
        product_id: insertedProduct.id,
        unit_type: variant.unit_type,
        unit_price: parseFloat(variant.unit_price) || 0,
        units_per_variant: parseInt(variant.units_per_variant, 10) || 1,
        is_default: !!variant.is_default,
      }));

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantsError) {
        throw variantsError;
      }

      addNotification("Product added successfully!", "success");
      onProductAdded();
      onClose();
    } catch (e) {
      console.error("Error adding product:", e);
      setError("Failed to add product: " + e.message);
      addNotification("Failed to add product.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name *
                </label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product-quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Quantity Available *
              </label>
              <input
                id="product-quantity"
                type="number"
                name="quantity"
                placeholder="Total Quantity Available"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="product-expire-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expiry Date
              </label>
              <input
                id="product-expire-date"
                type="date"
                name="expireDate"
                value={formData.expireDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Type
              </label>
              <select
                id="product-type"
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Medicine">Medicine</option>
                <option value="Supplement">Supplement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Description
            </label>
            <textarea
              id="product-description"
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product Variants Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pricing Variants
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={`variant-${variant.unit_type}-${index}`}
                  className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-3">
                    <select
                      value={variant.unit_type}
                      onChange={(e) =>
                        handleVariantChange(index, "unit_type", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="piece">Piece</option>
                      <option value="sheet">Sheet</option>
                      <option value="box">Box</option>
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.unit_price}
                      onChange={(e) =>
                        handleVariantChange(index, "unit_price", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Units per"
                      value={variant.units_per_variant}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "units_per_variant",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="default_variant"
                        checked={variant.is_default}
                        onChange={() =>
                          handleVariantChange(index, "is_default", true)
                        }
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Default</span>
                    </label>
                  </div>

                  <div className="col-span-2">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Set different prices for different units (piece, sheet, box). The
              default variant will be used as the main price.
            </p>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProductAdded: PropTypes.func.isRequired,
};

export default AddProductModal;
