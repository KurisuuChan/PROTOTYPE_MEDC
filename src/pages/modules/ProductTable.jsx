import React from "react";
import PropTypes from "prop-types";
import ProductTableRow from "./ProductTableRow";

const ProductTable = ({
  products,
  selectedItems,
  setSelectedItems,
  searchedProducts,
  onViewProduct,
  onEditProduct,
  highlightedRow,
}) => {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(searchedProducts.map((p) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg hidden md:block">
      <table className="min-w-[900px] w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 w-12 text-left">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onChange={handleSelectAll}
                checked={
                  searchedProducts.length > 0 &&
                  selectedItems.length === searchedProducts.length
                }
              />
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Medicine ID
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Expire Date
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Product Type
            </th>
            <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                isSelected={selectedItems.includes(product.id)}
                onSelectItem={handleSelectItem}
                onViewProduct={onViewProduct}
                onEditProduct={onEditProduct}
                isHighlighted={highlightedRow === product.id}
              />
            ))
          ) : (
            <tr>
              <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const MobileProductCards = ({
  products,
  selectedItems,
  handleSelectItem,
  onViewProduct,
  onEditProduct,
}) => {
  const renderStatusBadge = (status) => {
    const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
    if (status === "Available")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Available</span>
      );
    if (status === "Unavailable")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>Unavailable</span>
      );
    return (
      <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>
    );
  };

  const renderQuantityChip = (qty) => {
    let cls = "bg-gray-100 text-gray-700";
    if (qty === 0) cls = "bg-red-100 text-red-700";
    else if (qty <= 10) cls = "bg-yellow-100 text-yellow-700";
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
        {qty}
      </span>
    );
  };

  const renderExpiryChip = (dateStr) => {
    if (!dateStr) return <span className="text-gray-400">N/A</span>;
    const today = new Date();
    const exp = new Date(dateStr);
    let cls = "bg-gray-100 text-gray-700";
    if (exp < today) cls = "bg-red-100 text-red-700";
    else {
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) cls = "bg-orange-100 text-orange-700";
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
        {dateStr}
      </span>
    );
  };

  return (
    <div className="md:hidden space-y-3">
      {products.length > 0 ? (
        products.map((p) => (
          <div
            key={p.id}
            className="border border-gray-200 rounded-xl p-4 bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedItems.includes(p.id)}
                    onChange={() => handleSelectItem(p.id)}
                  />
                  <p className="text-xs text-gray-500">{p.medicineId}</p>
                </div>
                <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-500">{p.category}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {renderQuantityChip(p.quantity)}
                <span className="text-sm font-semibold text-gray-900">
                  ₱{p.price?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {renderExpiryChip(p.expireDate)}
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{p.productType}</span>
              </div>
              <div>{renderStatusBadge(p.status)}</div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => onViewProduct(p)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View
              </button>
              <button
                onClick={() => onEditProduct(p)}
                className="px-3 py-1.5 text-sm rounded-lg border border-green-300 text-green-700 hover:bg-green-50"
              >
                Edit
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">No products found.</div>
      )}
    </div>
  );
};

MobileProductCards.propTypes = {
  products: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  onViewProduct: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
  searchedProducts: PropTypes.array.isRequired,
  onViewProduct: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
  highlightedRow: PropTypes.number,
};

export default ProductTable;

// Named export for mobile cards to render alongside table in parent if needed
export { MobileProductCards };
