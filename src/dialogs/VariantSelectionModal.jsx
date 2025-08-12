// src/dialogs/VariantSelectionModal.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Package, FileText, Circle, Minus, Plus } from "lucide-react";

const VariantSelectionModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  cart,
  existingCartItem,
  reservedPieces = 0,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (!product) return;

    // Determine the initial variant to select
    const initialVariant =
      existingCartItem?.selectedVariant ||
      product.product_variants?.find((v) => v.is_default) ||
      product.product_variants?.[0] ||
      null;

    setSelectedVariant(initialVariant);

    // Check if the exact variant is already in the cart to determine "Update" state
    const uniqueId = initialVariant
      ? `${product.id}-${initialVariant.id}`
      : product.id.toString();
    const cartItemForVariant = cart.find((item) => item.uniqueId === uniqueId);

    setIsUpdate(!!cartItemForVariant);
    setQuantity(cartItemForVariant?.quantity || 1);
  }, [product, existingCartItem, cart]);

  const getMaxQuantityForVariant = () => {
    if (product?.quantity === undefined) return 0;
    const availablePieces = Math.max(
      0,
      product.quantity - (reservedPieces || 0)
    );
    const unitsPerVariant = selectedVariant?.units_per_variant || 1;
    return Math.floor(availablePieces / unitsPerVariant);
  };

  const handleQuantityChange = (e) => {
    if (product?.quantity === undefined) return;
    const newQuantity = parseInt(e.target.value, 10);
    const maxQuantity = getMaxQuantityForVariant();
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    const currentPrice = selectedVariant
      ? selectedVariant.unit_price
      : product.price;

    const cartItem = {
      ...product,
      quantity,
      selectedVariant,
      currentPrice,
    };
    onAddToCart(cartItem);
    onClose();
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    const uniqueId = `${product.id}-${variant.id}`;
    const cartItemForVariant = cart.find((item) => item.uniqueId === uniqueId);
    setIsUpdate(!!cartItemForVariant);
    setQuantity(cartItemForVariant?.quantity || 1);
  };

  // Helper functions for UI
  const getVariantIcon = (unitType) => {
    switch (unitType) {
      case "box":
        return <Package size={16} className="text-blue-600" />;
      case "sheet":
        return <FileText size={16} className="text-green-600" />;
      default:
        return <Circle size={16} className="text-purple-600" />;
    }
  };

  const getVariantLabel = (unitType) => {
    switch (unitType) {
      case "box":
        return "Box";
      case "sheet":
        return "Sheet";
      default:
        return "Piece";
    }
  };

  if (!isOpen || !product) return null;

  const maxQuantityForVariant = getMaxQuantityForVariant();
  const isAddToCartDisabled =
    (product.product_variants?.length > 0 && !selectedVariant) ||
    quantity < 1 ||
    quantity > maxQuantityForVariant ||
    maxQuantityForVariant < 1;
  const currentPrice = selectedVariant
    ? selectedVariant.unit_price
    : product.price;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Available Stock (Pieces):
              </span>
              <span className="text-lg font-bold text-green-600">
                {product.quantity}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {product.description || "No description available"}
            </div>
          </div>
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Select Unit Type</h3>
              <div className="space-y-2">
                {product.product_variants.map((variant) => (
                  <label
                    key={variant.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={variant.id}
                      checked={selectedVariant?.id === variant.id}
                      onChange={() => handleVariantChange(variant)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      {getVariantIcon(variant.unit_type)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {getVariantLabel(variant.unit_type)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {variant.units_per_variant} piece(s) per{" "}
                          {variant.unit_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">
                          ₱{variant.unit_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max={maxQuantityForVariant}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= maxQuantityForVariant}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Max available: {maxQuantityForVariant}{" "}
              {getVariantLabel(selectedVariant?.unit_type || "piece")}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₱{(currentPrice * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isUpdate ? "Update Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

VariantSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onAddToCart: PropTypes.func.isRequired,
  cart: PropTypes.array.isRequired,
  existingCartItem: PropTypes.object,
  reservedPieces: PropTypes.number,
};

export default VariantSelectionModal;
