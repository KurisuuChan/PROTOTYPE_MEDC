import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { PlusCircle, X, Plus, Trash2 } from "lucide-react";
import { useAddProduct } from "@/hooks/useAddProduct.jsx";

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
  const {
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
  } = useAddProduct(() => {
    onProductAdded();
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

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
                  className="w-full p-3 border border-gray-300 rounded-lg"
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
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="product-supplier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Supplier
              </label>
              <input
                id="product-supplier"
                type="text"
                name="supplier"
                placeholder="e.g., PharmaCorp"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="product-quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Quantity *
              </label>
              <input
                id="product-quantity"
                type="number"
                name="quantity"
                placeholder="Total Quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label
                htmlFor="product-cost-price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cost Price (₱) *
              </label>
              <input
                id="product-cost-price"
                type="number"
                name="cost_price"
                placeholder="Cost per item"
                value={formData.cost_price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                step="0.01"
                min="0"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <textarea
            id="product-description"
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px]"
          />

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pricing Variants
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Plus size={16} /> Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="col-span-3">
                    <select
                      value={variant.unit_type}
                      onChange={(e) =>
                        handleVariantChange(
                          variant.id,
                          "unit_type",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
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
                        handleVariantChange(
                          variant.id,
                          "unit_price",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Units"
                      value={variant.units_per_variant}
                      onChange={(e) =>
                        handleVariantChange(
                          variant.id,
                          "units_per_variant",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="1"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="default_variant"
                        checked={variant.is_default}
                        onChange={() =>
                          handleVariantChange(variant.id, "is_default", true)
                        }
                      />{" "}
                      Default
                    </label>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
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
