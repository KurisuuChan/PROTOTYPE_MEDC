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
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700">{status}</span>
          </div>
        );
      case "Unavailable":
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700">{status}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">{status}</span>
          </div>
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
    <tr className={`transition-colors duration-200 ${getRowClass()}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isSelected}
          onChange={() => onSelectItem(product.id)}
        />
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-500">{product.medicineId}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
      {/* ADDED SUPPLIER CELL */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {product.supplier || "N/A"}
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium">
        {product.quantity}
      </td>
      <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
        ₱{product.price?.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {product.expireDate || "N/A"}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-center">
        {getStatusBadge(product.status)}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onViewProduct(product)}
            className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEditProduct(product)}
            className="p-2 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600"
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
