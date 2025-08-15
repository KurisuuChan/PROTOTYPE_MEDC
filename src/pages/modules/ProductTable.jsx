import React from "react";
import PropTypes from "prop-types";
import ProductTableRow from "./ProductTableRow";
import { PackageX } from "lucide-react";

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
    <>
      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg hidden md:block">
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 w-12 text-left">
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              {/* ADDED SUPPLIER HEADER */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
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
                <td
                  colSpan="9" // <-- INCREASED COLSPAN
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <PackageX size={48} className="mb-2" />
                    <p className="font-semibold">No products found.</p>
                    <p className="text-sm">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <MobileProductCards
        products={products}
        selectedItems={selectedItems}
        handleSelectItem={handleSelectItem}
        onViewProduct={onViewProduct}
        onEditProduct={onEditProduct}
      />
    </>
  );
};

const MobileProductCards = ({
  products,
  selectedItems,
  handleSelectItem,
  onViewProduct,
  onEditProduct,
}) => {
  return (
    <div className="md:hidden space-y-4">
      {products.length > 0 ? (
        products.map((p) => (
          <div
            key={p.id}
            className={`border rounded-xl p-4 bg-white transition-all ${
              selectedItems.includes(p.id)
                ? "border-blue-500 shadow-md"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedItems.includes(p.id)}
                    onChange={() => handleSelectItem(p.id)}
                  />
                  <div>
                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category}</p>
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₱{p.price?.toFixed(2)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Stock</p>
                <p className="font-medium">{p.quantity} units</p>
              </div>
              <div>
                <p className="text-gray-500">Expiry</p>
                <p className="font-medium">{p.expireDate || "N/A"}</p>
              </div>
              {/* ADDED SUPPLIER TO MOBILE CARD */}
              <div>
                <p className="text-gray-500">Supplier</p>
                <p className="font-medium">{p.supplier || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">{p.status}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => onViewProduct(p)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View
              </button>
              <button
                onClick={() => onEditProduct(p)}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-12">
          <PackageX size={48} className="mx-auto mb-2" />
          <p className="font-semibold">No products found.</p>
        </div>
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
export { MobileProductCards };
