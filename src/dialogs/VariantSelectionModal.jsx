import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  Package,
  FileText,
  Circle,
  Percent,
  Minus,
  Plus,
} from "lucide-react";

const VariantSelectionModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  existingCartItem,
  reservedPieces = 0,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (!product?.price || !product?.quantity) return;

    if (product.product_variants?.length > 0) {
      // Set default variant (either existing selection or default variant)
      const defaultVariant =
        existingCartItem?.selectedVariant ||
        product.product_variants.find((v) => v.is_default) ||
        product.product_variants[0];
      setSelectedVariant(defaultVariant);
    } else if (!product.product_variants) {
      // For products without variants, set final price to product price
      setFinalPrice(product.price);
    }

    if (existingCartItem) {
      setQuantity(existingCartItem.quantity);
      // Calculate existing discount
      const originalPrice =
        existingCartItem.selectedVariant?.unit_price || product.price;
      const currentPrice = existingCartItem.currentPrice;
      if (originalPrice !== currentPrice) {
        const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
        setDiscountPercent(discount);
        setDiscountAmount(originalPrice - currentPrice);
      }
    }
  }, [product, existingCartItem]);

  useEffect(() => {
    if (!product?.price) return;

    if (selectedVariant) {
      const basePrice = selectedVariant.unit_price;
      const discountValue = (basePrice * discountPercent) / 100;
      setDiscountAmount(discountValue);
      setFinalPrice(basePrice - discountValue);
    } else if (!product.product_variants) {
      // For products without variants, use main product price
      const basePrice = product.price;
      const discountValue = (basePrice * discountPercent) / 100;
      setDiscountAmount(discountValue);
      setFinalPrice(basePrice - discountValue);
    }
  }, [selectedVariant, discountPercent, product]);

  const handleQuantityChange = (e) => {
    if (!product?.quantity) return;

    const newQuantity = parseInt(e.target.value, 10);
    const maxQuantity = getMaxQuantityForVariant();

    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const getMaxQuantityForVariant = () => {
    if (!product?.quantity) return 0;

    const availablePieces = Math.max(
      0,
      product.quantity - (reservedPieces || 0)
    );
    const upv = selectedVariant?.units_per_variant || 1;
    return Math.floor(availablePieces / upv);
  };

  const handleDiscountChange = (e) => {
    const newDiscount = parseFloat(e.target.value);
    if (!isNaN(newDiscount) && newDiscount >= 0 && newDiscount <= 100) {
      setDiscountPercent(newDiscount);
    }
  };

  const handleAddToCart = () => {
    if (!product?.price) return;

    // For products without variants, use the main product price
    if (!selectedVariant && !product.product_variants) {
      const cartItem = {
        ...product,
        quantity,
        selectedVariant: null,
        currentPrice: finalPrice || product.price,
        discountPercent,
        discountAmount,
        originalPrice: product.price,
      };

      onAddToCart(cartItem);
      onClose();
      return;
    }

    // For products with variants, require variant selection
    if (!selectedVariant) return;

    const cartItem = {
      ...product,
      quantity,
      selectedVariant,
      currentPrice: finalPrice,
      discountPercent,
      discountAmount,
      originalPrice: selectedVariant.unit_price,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const getVariantIcon = (unitType) => {
    switch (unitType) {
      case "box":
        return <Package size={16} className="text-blue-600" />;
      case "sheet":
        return <FileText size={16} className="text-green-600" />;
      case "piece":
        return <Circle size={16} className="text-purple-600" />;
      default:
        return <Circle size={16} className="text-gray-600" />;
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
        return unitType;
    }
  };

  if (!isOpen || !product) return null;

  // Safety check to ensure product has required properties
  if (
    !product.name ||
    product.price === undefined ||
    product.quantity === undefined
  ) {
    console.warn("VariantSelectionModal: Invalid product data", product);
    return null;
  }

  // Additional safety check for product properties
  if (
    typeof product.price !== "number" ||
    typeof product.quantity !== "number"
  ) {
    console.warn(
      "VariantSelectionModal: Invalid product price or quantity",
      product
    );
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Available Stock:
              </span>
              <span className="text-lg font-bold text-green-600">
                {product.quantity}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {product.description || "No description available"}
            </div>
          </div>

          {/* Variant Selection */}
          {product.product_variants && product.product_variants.length > 0 ? (
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
                      onChange={() => setSelectedVariant(variant)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      {getVariantIcon(variant.unit_type)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {getVariantLabel(variant.unit_type)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {variant.units_per_variant > 1
                            ? `${variant.units_per_variant} pieces per ${variant.unit_type}`
                            : "1 piece per unit"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">
                          ₱{variant.unit_price.toFixed(2)}
                        </div>
                        {variant.is_default && (
                          <div className="text-xs text-green-600 font-medium">
                            Default
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Product Information
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Unit Price:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₱{product.price?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max={getMaxQuantityForVariant()}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const maxQuantity = getMaxQuantityForVariant();
                  if (quantity < maxQuantity) {
                    setQuantity(quantity + 1);
                  }
                }}
                disabled={quantity >= getMaxQuantityForVariant()}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Max available: {getMaxQuantityForVariant()}{" "}
              {selectedVariant ? selectedVariant.unit_type : "units"}
              {selectedVariant && selectedVariant.units_per_variant > 1 && (
                <span className="text-gray-400">
                  {" "}
                  ({Math.max(0, product.quantity - (reservedPieces || 0))} total
                  pieces)
                </span>
              )}
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Percent size={16} />
              Discount
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercent}
                  onChange={handleDiscountChange}
                  placeholder="0"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600">%</span>
              </div>
              {discountPercent > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Original Price:</span>
                      <span>
                        ₱
                        {selectedVariant?.unit_price?.toFixed(2) ||
                          product.price?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount Amount:</span>
                      <span>-₱{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>Final Price:</span>
                      <span>₱{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unit Price:</span>
                <span>
                  ₱
                  {selectedVariant?.unit_price?.toFixed(2) ||
                    product.price?.toFixed(2)}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-₱{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₱{(finalPrice * quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={
              (!selectedVariant && product.product_variants) || quantity < 1
            }
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {existingCartItem ? "Update Cart" : "Add to Cart"}
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
  existingCartItem: PropTypes.object,
  reservedPieces: PropTypes.number,
};

export default VariantSelectionModal;
