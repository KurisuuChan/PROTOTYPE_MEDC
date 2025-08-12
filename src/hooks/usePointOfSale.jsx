// src/utils/formatters.js
export const formatStock = (quantity, variants) => {
  if (!variants || variants.length === 0) {
    return `${quantity} pieces`;
  }

  let remaining = quantity;
  const parts = [];

  const sortedVariants = [...variants].sort(
    (a, b) => b.units_per_variant - a.units_per_variant
  );

  for (const variant of sortedVariants) {
    if (variant.units_per_variant > 1) {
      const count = Math.floor(remaining / variant.units_per_variant);
      if (count > 0) {
        parts.push(`${count} ${variant.unit_type}(s)`);
        remaining %= variant.units_per_variant;
      }
    }
  }

  if (remaining > 0) {
    parts.push(`${remaining} piece(s)`);
  }

  if (parts.length === 0 && quantity === 0) {
    return "Out of Stock";
  }

  return parts.length > 0 ? parts.join(", ") : `${quantity} pieces`;
};
