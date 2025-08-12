import React from "react";
import PropTypes from "prop-types";
import { Eye, Pencil } from "lucide-react";

const ProductTableRow = ({
  product,
  isSelected,
  onSelectItem,
  onViewProduct,
  onEditProduct,
  isHighlighted,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return (
          <span className="px-3 py-1 text-xs font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
            {status}
          </span>
        );
      case "Unavailable":
        return (
          <span className="px-3 py-1 text-xs font-semibold leading-tight text-red-700 bg-red-100 rounded-full">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full">
            {status}
          </span>
        );
    }
  };

  const getRowClass = () => {
    if (isHighlighted) {
      return "bg-yellow-100 animate-pulse-once";
    }
    if (isSelected) {
      return "bg-blue-50";
    }
    return "hover:bg-gray-50";
  };

  return (
    <tr
      className={`transition-colors duration-500 group align-middle ${getRowClass()}`}
    >
      <td className="px-4 sm:px-6 py-4">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isSelected}
          onChange={() => onSelectItem(product.id)}
        />
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
        {product.medicineId}
      </td>
      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
        {product.name}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
        {product.category}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-center">
        {(() => {
          let qtyClass = "bg-gray-100 text-gray-700";
          if (product.quantity === 0) qtyClass = "bg-red-100 text-red-700";
          else if (product.quantity <= 10)
            qtyClass = "bg-yellow-100 text-yellow-700";
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${qtyClass}`}
            >
              {product.quantity}
            </span>
          );
        })()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 text-center">
        <div className="flex flex-col gap-1">
          <span className="font-medium">₱{product.price?.toFixed(2)}</span>
          {product.product_variants && product.product_variants.length > 1 && (
            <div className="text-xs text-gray-500">
              {product.product_variants.slice(0, 2).map((variant) => (
                <div key={variant.id} className="flex justify-between">
                  <span>{variant.unit_type}:</span>
                  <span>₱{variant.unit_price?.toFixed(2)}</span>
                </div>
              ))}
              {product.product_variants.length > 2 && (
                <span className="text-gray-400">
                  +{product.product_variants.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm whitespace-nowrap">
        {(() => {
          if (!product.expireDate)
            return <span className="text-gray-400">N/A</span>;
          const today = new Date();
          const exp = new Date(product.expireDate);
          let expClass = "bg-gray-100 text-gray-700";
          if (exp < today) expClass = "bg-red-100 text-red-700";
          else {
            const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 30) expClass = "bg-orange-100 text-orange-700";
          }
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${expClass}`}
            >
              {product.expireDate}
            </span>
          );
        })()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
        {product.productType}
      </td>
      <td className="px-4 sm:px-6 py-4 text-center">
        {getStatusBadge(product.status)}
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onViewProduct(product)}
            className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEditProduct(product)}
            className="p-2 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600 transition-colors"
            title="Edit Product"
          >
            <Pencil size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

ProductTableRow.propTypes = {
  product: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onViewProduct: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
  isHighlighted: PropTypes.bool,
};

export default ProductTableRow;
