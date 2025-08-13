import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { supabase } from "../supabase/client";
import { X, Edit } from "lucide-react";
import { useNotification } from "@/hooks/useNotifications";
import { addSystemNotification } from "@/utils/notificationStorage";

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

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState(product);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  useEffect(() => {
    // When the product prop changes, update the form data
    if (product) {
      setFormData(product);
      setError("");
      // Fetch variants for this product
      if (product.id) {
        const fetchVariants = async () => {
          const { data: variantData } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", product.id)
            .order("unit_type");
          setVariants(variantData || []);
        };
        fetchVariants();
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Create a mutable copy and remove properties that shouldn't be updated.
    const updateData = { ...formData };
    delete updateData.product_variants; // Remove nested variant data
    const id = updateData.id; // Store the id separately
    delete updateData.id; // Remove id from the update payload

    // Ensure quantity is a number
    updateData.quantity = parseInt(updateData.quantity, 10) || 0;

    const originalPrice = product?.price;

    const { error: updateError } = await supabase
      .from("products")
      .update(updateData) // Use the cleaned updateData object
      .eq("id", id); // Use the stored id to find the correct row

    if (updateError) {
      console.error("Error updating product:", updateError);
      setError("Failed to update product: " + updateError.message);
      addNotification("Failed to update product.", "error");
    } else {
      addNotification("Product updated successfully!", "success");
      // If price changed, add a system notification
      if (
        typeof originalPrice !== "undefined" &&
        typeof updateData.price !== "undefined" &&
        Number(originalPrice) !== Number(updateData.price)
      ) {
        addSystemNotification({
          id: `price-${id}-${Date.now()}`,
          iconType: "price",
          iconBg: "bg-blue-100",
          title: "Price Updated",
          category: "System",
          description: `Price changed from ₱${originalPrice} to ₱${
            updateData.price
          } for ${updateData.name || product.name}.`,
          createdAt: new Date().toISOString(),
          path: "/management",
        });
      }
      onProductUpdated();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Edit className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-8 pb-8 flex-1"
        >
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-product-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Name *
                  </label>
                  <input
                    id="edit-product-name"
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-product-category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="edit-product-category"
                    name="category"
                    value={formData.category || ""}
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
            {/* Pricing & Inventory */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="edit-product-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Base Price (₱)
                  </label>
                  <input
                    id="edit-product-price"
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-product-cost-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cost Price (₱)
                  </label>
                  <input
                    id="edit-product-cost-price"
                    type="number"
                    name="cost_price"
                    value={formData.cost_price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-product-quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Stock
                  </label>
                  <input
                    id="edit-product-quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity || ""}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            {/* Product Details */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3">
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-product-expire-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expiry Date
                  </label>
                  <input
                    id="edit-product-expire-date"
                    type="date"
                    name="expireDate"
                    value={formData.expireDate || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-product-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Type
                  </label>
                  <select
                    id="edit-product-type"
                    name="productType"
                    value={formData.productType || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="edit-product-status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="edit-product-status"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Variants Display */}
            {variants.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Pricing Variants (Read-Only)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`p-4 border rounded-lg ${
                        variant.is_default
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 capitalize">
                          {variant.unit_type}
                        </span>
                        {variant.is_default && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        ₱{variant.unit_price?.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {variant.units_per_variant > 1
                          ? `${variant.units_per_variant} pieces per ${variant.unit_type}`
                          : "1 piece per unit"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onProductUpdated: PropTypes.func.isRequired,
};

export default EditProductModal;
