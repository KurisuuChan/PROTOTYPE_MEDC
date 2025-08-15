import React from "react";
import PropTypes from "prop-types";
import { X, Eye } from "lucide-react";

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-gray-800">{value || "N/A"}</p>
  </div>
);

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return "N/A";
    }
    return `₱${price.toFixed(2)}`;
  };

  const getStockStatusClasses = (quantity) => {
    if (quantity === 0) {
      return "bg-red-50 border-red-200";
    }
    if (quantity <= 10) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-green-50 border-green-200";
  };

  const getStockIndicatorClasses = (quantity) => {
    if (quantity === 0) {
      return "bg-red-500";
    }
    if (quantity <= 10) {
      return "bg-yellow-500";
    }
    return "bg-green-500";
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) {
      return "Out of Stock";
    }
    if (quantity <= 10) {
      return "Low Stock Alert";
    }
    return "Stock Available";
  };

  const getStockStatusDescription = (quantity) => {
    if (quantity === 0) {
      return "This product needs to be restocked immediately.";
    }
    if (quantity <= 10) {
      return "Consider restocking soon to avoid stockouts.";
    }
    return "Stock levels are healthy.";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Eye className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">
                {product.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-8 pb-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <DetailField label="Medicine Category" value={product.category} />
            <DetailField label="Supplier" value={product.supplier} />
            <DetailField
              label="Base Price"
              value={formatPrice(product.price)}
            />
            <DetailField
              label="Cost Price"
              value={formatPrice(product.cost_price)}
            />
            <DetailField
              label="Current Stock"
              value={`${product.quantity} units`}
            />
            <DetailField label="Expiry Date" value={product.expireDate} />
            <DetailField label="Product Type" value={product.productType} />
            <DetailField label="Status" value={product.status} />
          </div>

          {/* Stock Status Indicator */}
          <div className="mt-6">
            <div
              className={`p-4 rounded-lg border ${getStockStatusClasses(
                product.quantity
              )}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStockIndicatorClasses(
                    product.quantity
                  )}`}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getStockStatusText(product.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getStockStatusDescription(product.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {product.product_variants && product.product_variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-3">
                Pricing Variants
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.product_variants.map((variant) => (
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
                    <div className="text-2xl font-bold text-blue-600">
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

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">
              Medicine Description
            </p>
            <div className="mt-1 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm min-h-[100px]">
              {product.description || "No description available."}
            </div>
          </div>

          <div className="mt-8 text-right">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ViewProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.number,
    cost_price: PropTypes.number,
    quantity: PropTypes.number,
    status: PropTypes.string,
    expireDate: PropTypes.string,
    productType: PropTypes.string,
    description: PropTypes.string,
    supplier: PropTypes.string,
    product_variants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        unit_type: PropTypes.string,
        unit_price: PropTypes.number,
        units_per_variant: PropTypes.number,
        is_default: PropTypes.bool,
      })
    ),
  }).isRequired,
};

export default ViewProductModal;
