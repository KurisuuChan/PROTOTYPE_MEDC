import React from "react";
import PropTypes from "prop-types";
import { X, Edit } from "lucide-react";
import { useEditProduct } from "@/hooks/useEditProduct.jsx"; // Import our new hook

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
  const { formData, handleChange, handleSubmit, isLoading, error } =
    useEditProduct(product, () => {
      onProductUpdated(); // This is still useful for things like closing the modal
      onClose();
    });

  if (!isOpen || !formData) return null;

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
            {/* Form fields remain the same, but now use `formData` and `handleChange` from the hook */}
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
            {/* ... other form fields for price, quantity, etc. ... */}
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
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
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
