import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import * as api from "@/services/api";
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

const PointOfSales = ({ branding }) => {
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingCartItem, setEditingCartItem] = useState(null);
  const PWD_SENIOR_DISCOUNT = 0.2;

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await api.getAvailableProductsWithVariants();

    if (error) {
      console.error("Error fetching products:", error);
      setError(error);
    } else {
      setAvailableMedicines(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectMedicine = (medicine) => {
    if (!medicine?.id) {
      console.warn("handleSelectMedicine: Invalid medicine data", medicine);
      return;
    }

    // Check if item is already in cart
    const itemInCart = cart.find((item) => item.id === medicine.id);

    if (itemInCart) {
      // If item exists, open modal to edit quantity/variant/discount
      setEditingCartItem(itemInCart);
      setSelectedProduct(medicine);
      setIsVariantModalOpen(true);
    } else {
      // If new item, open modal to select variant and quantity
      setEditingCartItem(null);
      setSelectedProduct(medicine);
      setIsVariantModalOpen(true);
    }
  };

  const handleAddToCart = (cartItem) => {
    if (!cartItem?.id) {
      console.warn("handleAddToCart: Invalid cart item data", cartItem);
      return;
    }

    if (editingCartItem) {
      // Update existing cart item
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === cartItem.id ? cartItem : item))
      );
    } else {
      // Add new item to cart
      setCart((prevCart) => [...prevCart, cartItem]);
    }

    // Reset modal state
    setIsVariantModalOpen(false);
    setSelectedProduct(null);
    setEditingCartItem(null);
  };

  const getReservedPieces = (productId, excludeVariantId = null) => {
    return cart
      .filter((item) => item.id === productId)
      .reduce((sum, item) => {
        if (excludeVariantId && item.selectedVariant?.id === excludeVariantId) {
          return sum;
        }
        const upv = item.selectedVariant?.units_per_variant || 1;
        return sum + item.quantity * upv;
      }, 0);
  };

  const updateQuantity = (medicineId, newQuantity) => {
    const medicine = availableMedicines.find((m) => m.id === medicineId);
    const cartItem = cart.find((item) => item.id === medicineId);
    if (!medicine || !cartItem) return;

    const unitsPerVariant = cartItem.selectedVariant?.units_per_variant || 1;
    const reservedOtherPieces = getReservedPieces(medicineId, cartItem.id);
    const availablePieces = Math.max(
      0,
      (medicine.quantity || 0) - reservedOtherPieces
    );
    const maxQuantity = Math.max(
      0,
      Math.floor(availablePieces / unitsPerVariant)
    );

    if (newQuantity < 1) {
      setCart(cart.filter((item) => item.id !== medicineId));
      return;
    }

    const clampedQuantity = Math.min(newQuantity, maxQuantity);
    setCart(
      cart.map((item) =>
        item.id === medicineId ? { ...item, quantity: clampedQuantity } : item
      )
    );
  };

  const handleQuantityChange = (medicineId, e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(medicineId, newQuantity);
    }
  };

  const total = useMemo(() => {
    const subtotal = cart.reduce(
      (acc, item) => acc + (item.currentPrice || item.price) * item.quantity,
      0
    );
    return isDiscounted ? subtotal * (1 - PWD_SENIOR_DISCOUNT) : subtotal;
  }, [cart, isDiscounted]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (item.currentPrice || item.price) * item.quantity,
      0
    );
  }, [cart]);

  const filteredMedicines = useMemo(() => {
    const filtered = availableMedicines.filter(
      (med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.medicineId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by category and then by name for better organization
    return filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }, [availableMedicines, searchTerm]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const { data: saleData, error: saleError } = await api.addSale({
        total_amount: total,
        discount_applied: isDiscounted,
      });

      if (saleError) throw saleError;

      const saleItemsToInsert = cart.map((item) => ({
        sale_id: saleData.id,
        product_id: item.id,
        variant_id: item.selectedVariant?.id || null,
        quantity: item.quantity,
        unit_type: item.selectedVariant?.unit_type || "unit",
        price_at_sale: item.currentPrice || item.price,
      }));

      const { error: saleItemsError } = await api.addSaleItems(
        saleItemsToInsert
      );
      if (saleItemsError) throw saleItemsError;

      for (const item of cart) {
        const { data: product, error: fetchError } = await api.getProductById(
          item.id
        );
        if (fetchError) throw fetchError;
        const unitsPerVariant = item.selectedVariant?.units_per_variant || 1;
        const decrementUnits = item.quantity * unitsPerVariant;
        const newQuantity = Math.max(
          0,
          (product.quantity || 0) - decrementUnits
        );
        const { error: updateError } = await api.updateProduct(item.id, {
          quantity: newQuantity,
          status: newQuantity > 0 ? "Available" : "Unavailable",
        });
        if (updateError) throw updateError;
      }

      setCart([]);
      setIsDiscounted(false);
      fetchProducts();
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Get low stock products for alerts
  const lowStockProducts = useMemo(() => {
    return availableMedicines.filter(
      (med) => med.quantity <= 10 && med.quantity > 0
    );
  }, [availableMedicines]);

  const outOfStockProducts = useMemo(() => {
    return availableMedicines.filter((med) => med.quantity === 0);
  }, [availableMedicines]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem fetching the data. Please check your internet
          connection.
        </p>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          <RefreshCw size={16} />
          Try Again
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
          {/* Stock Alerts */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="mb-4 space-y-2">
              {outOfStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-800">
                      {outOfStockProducts.length} product
                      {outOfStockProducts.length > 1 ? "s" : ""} out of stock
                    </span>
                  </div>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      {lowStockProducts.length} product
                      {lowStockProducts.length > 1 ? "s" : ""} running low on
                      stock
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
                id="pos-search"
                name="pos-search"
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
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMedicines.map((med) => {
                  let stockClass = "text-gray-400";
                  let stockText = `${med.quantity} available`;
                  if (med.quantity === 0) {
                    stockClass = "text-red-500 font-medium";
                    stockText = "Out of Stock";
                  } else if (med.quantity <= 10) {
                    stockClass = "text-yellow-600 font-medium";
                    stockText = `${med.quantity} available (Low Stock)`;
                  }

                  return (
                    <div
                      key={med.id}
                      className="border rounded-lg transition-all duration-200 hover:shadow-md hover:border-blue-400"
                    >
                      <button
                        onClick={() => handleSelectMedicine(med)}
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

                        {/* Variant Pricing Display */}
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
                  <div key={item.id} className="flex items-center gap-4">
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
                            availableMedicines.find((m) => m.id === item.id)
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
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e)}
                        className="w-12 text-center font-medium border border-gray-200 rounded-md"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
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
                      onClick={() => updateQuantity(item.id, 0)}
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
                  <span>-₱{(subtotal * PWD_SENIOR_DISCOUNT).toFixed(2)}</span>
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
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Complete Sale"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
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
