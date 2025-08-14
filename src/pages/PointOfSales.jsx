// src/pages/PointOfSales.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Loader2,
  History,
  WifiOff,
  RefreshCw,
  Package,
  FileText,
  Circle,
  Edit,
  Percent,
} from "lucide-react";
import SalesHistoryModal from "@/dialogs/SalesHistoryModal";
import VariantSelectionModal from "@/dialogs/VariantSelectionModal";
import { usePointOfSale } from "@/hooks/usePointOfSale";
import { useProducts } from "@/hooks/useProducts.jsx";
import { formatStock } from "@/utils/formatters";

const PointOfSales = ({ branding }) => {
  const { products, isLoading: productsLoading, isError } = useProducts();

  const {
    loading: posLoading,
    cart,
    searchTerm,
    setSearchTerm,
    isDiscounted,
    setIsDiscounted,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    isVariantModalOpen,
    setIsVariantModalOpen,
    selectedProduct,
    setSelectedProduct,
    editingCartItem,
    setEditingCartItem,
    subtotal,
    total,
    filteredProducts,
    lowStockProducts,
    outOfStockProducts,
    handleSelectProduct,
    handleAddToCart,
    getReservedPieces,
    updateCartQuantity,
    handleCheckout,
  } = usePointOfSale(products, productsLoading);

  const getVariantIcon = (unitType) => {
    switch (unitType) {
      case "box":
        return <Package size={14} className="text-blue-600" />;
      case "sheet":
        return <FileText size={14} className="text-green-600" />;
      case "piece":
        return <Circle size={14} className="text-purple-600" />;
      default:
        return <Circle size={14} className="text-gray-600" />;
    }
  };

  const getVariantLabel = (unitType) => {
    switch (unitType) {
      case "box":
        return "Box";
      case "sheet":
        return "Sheet";
      case "piece":
        return "Piece";
      default:
        return "Unit";
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem fetching product data.
        </p>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <SalesHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        branding={branding}
      />
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-110px)]">
        <div className="flex-1 lg:w-3/5 bg-white p-6 rounded-2xl shadow-lg flex flex-col">
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="mb-4 space-y-2">
              {outOfStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">
                      {outOfStockProducts.length} product(s) out of stock
                    </span>
                  </div>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      {lowStockProducts.length} product(s) running low on stock
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 mb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, category, or ID..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <History size={18} />
              History
            </button>
          </div>
          <div className="flex-1 overflow-y-auto -m-2 p-2">
            {productsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((med) => {
                  let stockClass = "text-gray-400";
                  let stockText = formatStock(
                    med.quantity,
                    med.product_variants
                  );
                  if (med.quantity === 0) {
                    stockClass = "text-red-500 font-medium";
                  } else if (med.quantity <= 10) {
                    stockClass = "text-yellow-600 font-medium";
                  }

                  return (
                    <div
                      key={med.id}
                      className="border rounded-lg transition-all duration-200 hover:shadow-md hover:border-blue-400"
                    >
                      <button
                        onClick={() => handleSelectProduct(med)}
                        className={`w-full p-4 text-left transition-all duration-200 ${
                          cart.some((item) => item.id === med.id)
                            ? "bg-blue-50 border-blue-500 shadow-md"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800 leading-tight">
                            {med.name}
                          </h3>
                          <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                            ₱{med.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {med.category}
                        </p>
                        <p className={`text-xs mb-3 ${stockClass}`}>
                          {stockText}
                        </p>
                        {med.product_variants &&
                          med.product_variants.length > 1 && (
                            <div className="space-y-1">
                              {med.product_variants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-1 text-gray-600">
                                    {getVariantIcon(variant.unit_type)}
                                    <span>
                                      {getVariantLabel(variant.unit_type)}
                                    </span>
                                    {variant.units_per_variant > 1 && (
                                      <span className="text-gray-400">
                                        ({variant.units_per_variant})
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-medium text-gray-800">
                                    ₱{variant.unit_price.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="lg:w-2/5 bg-white p-6 rounded-2xl shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex-shrink-0">
            Order Summary
          </h2>
          <div className="flex-1 overflow-y-auto -mr-4 pr-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart size={48} className="mb-2" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Select items to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.uniqueId} className="flex items-center gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>
                          ₱{(item.currentPrice || item.price).toFixed(2)}
                        </span>
                        {item.selectedVariant ? (
                          <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {getVariantIcon(item.selectedVariant.unit_type)}
                            {getVariantLabel(item.selectedVariant.unit_type)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            <Circle size={12} />
                            Unit
                          </div>
                        )}
                        {(item.discountPercent || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            <Percent size={12} />
                            {(item.discountPercent || 0).toFixed(1)}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCartItem(item);
                          setSelectedProduct(
                            products.find((m) => m.id === item.id)
                          );
                          setIsVariantModalOpen(true);
                        }}
                        className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                        title="Edit variant, quantity, or discount"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.uniqueId, item.quantity - 1)
                        }
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartQuantity(
                            item.uniqueId,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-12 text-center font-medium border border-gray-200 rounded-md"
                      />
                      <button
                        onClick={() =>
                          updateCartQuantity(item.uniqueId, item.quantity + 1)
                        }
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="w-20 text-right font-bold">
                      ₱
                      {(
                        (item.currentPrice || item.price) * item.quantity
                      ).toFixed(2)}
                    </p>
                    <button
                      onClick={() => updateCartQuantity(item.uniqueId, 0)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-auto pt-6 border-t-2 border-dashed flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-600">
                PWD/Senior Discount (20%)
              </span>
              <button
                onClick={() => setIsDiscounted(!isDiscounted)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  isDiscounted ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    isDiscounted ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              {isDiscounted && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>PWD/Senior Discount (20%):</span>
                  <span>-₱{(subtotal * 0.2).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-6">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-300 disabled:shadow-none"
              disabled={posLoading || cart.length === 0}
            >
              {posLoading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Complete Sale"
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedProduct && isVariantModalOpen && (
        <VariantSelectionModal
          isOpen={isVariantModalOpen}
          onClose={() => {
            setIsVariantModalOpen(false);
            setSelectedProduct(null);
            setEditingCartItem(null);
          }}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          cart={cart}
          existingCartItem={editingCartItem}
          reservedPieces={getReservedPieces(
            selectedProduct.id,
            editingCartItem?.selectedVariant?.id || null
          )}
        />
      )}
    </>
  );
};

PointOfSales.propTypes = {
  branding: PropTypes.object.isRequired,
};

export default PointOfSales;
