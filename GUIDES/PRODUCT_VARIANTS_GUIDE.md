# 🏥 MedCure Product Variants System Guide

## Overview

The MedCure system now supports **Product Variants** - allowing you to sell the same medicine in different units (box, sheet, piece) with different prices. This is perfect for pharmacies that need flexible pricing strategies.

## 🆕 New Features

### 1. **Multiple Pricing Units**

- **Box**: For bulk purchases (e.g., 10 tablets per box)
- **Sheet**: For blister pack purchases (e.g., 2 tablets per sheet)
- **Piece**: For individual tablet purchases

### 2. **Smart Pricing**

- Each unit type can have its own price
- Automatic calculation of total cost
- Support for bulk discounts

### 3. **Enhanced CSV Import**

- Import products with variant pricing in one file
- Backward compatible with existing CSV format
- Template download available

## 📊 Database Structure

### New Table: `product_variants`

```sql
CREATE TABLE product_variants (
  id BIGINT PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  unit_type TEXT CHECK (unit_type IN ('box', 'sheet', 'piece')),
  unit_price NUMERIC NOT NULL,
  units_per_variant INTEGER DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE
);
```

### Updated Table: `sale_items`

- Added `variant_id` and `unit_type` columns
- Tracks which variant was sold

## 🚀 How to Use

### 1. **Adding Products with Variants**

#### Through the UI:

1. Go to **Management** → **Add Product**
2. Fill in basic product information
3. In the **Pricing Variants** section:
   - Click **"Add Variant"** for each unit type
   - Set the unit type (box/sheet/piece)
   - Set the price for that unit
   - Set how many base units are in this variant
   - Mark one as default (usually piece)

#### Example Variant Setup:

```
Product: Paracetamol 500mg
- Box: ₱45.00 (contains 10 tablets) - Default: No
- Sheet: ₱9.00 (contains 2 tablets) - Default: No
- Piece: ₱5.00 (1 tablet) - Default: Yes
```

### 2. **CSV Import with Variants**

#### New CSV Format:

```csv
name,category,quantity,price,expireDate,productType,description,boxPrice,boxUnits,sheetPrice,sheetUnits,piecePrice,pieceUnits
Paracetamol 500mg,Pain Relief,100,5.00,2025-12-31,Medicine,Generic pain reliever,45.00,10,9.00,2,5.00,1
```

#### Legacy CSV Format (Still Supported):

```csv
name,category,quantity,price,expireDate,productType,description
Paracetamol 500mg,Pain Relief,100,5.00,2025-12-31,Medicine,Generic pain reliever
```

### 3. **Point of Sales (POS)**

#### Customer Experience:

1. **Product Display**: Shows all available pricing options
2. **Unit Selection**: Customer can choose box, sheet, or piece
3. **Price Calculation**: Automatically calculates total based on selected unit
4. **Cart Management**: Tracks which unit type was selected

#### Example Sale:

```
Customer wants: 2 boxes of Paracetamol
- 2 boxes × ₱45.00 = ₱90.00
- Each box contains 10 tablets
- Total: 20 tablets for ₱90.00
```

## 💡 Best Practices

### 1. **Pricing Strategy**

- **Box**: Usually offers the best value per unit
- **Sheet**: Mid-range pricing for moderate quantities
- **Piece**: Highest per-unit price for convenience

### 2. **Inventory Management**

- Track total quantity available
- System automatically calculates available units for each variant
- Example: 100 tablets = 10 boxes OR 50 sheets OR 100 pieces

### 3. **Customer Communication**

- Clearly display all pricing options
- Show savings for bulk purchases
- Use icons to distinguish unit types

## 🔧 Technical Implementation

### 1. **Database Migration**

Run the provided `database_migration.sql` script to:

- Create the `product_variants` table
- Update existing `sale_items` table
- Create necessary indexes and functions

### 2. **API Endpoints**

```javascript
// Get products with variants
const products = await api.getAvailableProductsWithVariants();

// Get variants for a specific product
const variants = await api.getProductVariants(productId);

// Add new variant
await api.addProductVariant(variantData);
```

### 3. **Component Updates**

- `AddProductModal`: Enhanced with variant management
- `PointOfSales`: Updated to handle variant selection
- `ImportCSVModal`: Supports both old and new CSV formats

## 📱 User Interface Features

### 1. **Product Cards**

- Display all available pricing options
- Visual icons for different unit types
- Clear price comparison

### 2. **Variant Selection**

- Radio buttons for unit selection
- Real-time price updates
- Quantity validation

### 3. **Cart Display**

- Shows selected unit type
- Displays unit-specific pricing
- Calculates totals correctly

## 🚨 Important Notes

### 1. **Backward Compatibility**

- Existing products continue to work
- Old CSV imports still function
- Gradual migration possible

### 2. **Data Integrity**

- Each product must have at least one variant
- One variant must be marked as default
- Foreign key constraints ensure data consistency

### 3. **Performance**

- Indexes created for optimal query performance
- Efficient variant lookups
- Minimal impact on existing operations

## 🔍 Troubleshooting

### Common Issues:

#### 1. **"No variants found" error**

- Ensure product has at least one variant
- Check if variants were imported correctly

#### 2. **Price calculation errors**

- Verify variant prices are numeric
- Check default variant is set correctly

#### 3. **CSV import failures**

- Validate CSV format matches template
- Check for missing required columns
- Ensure price values are valid numbers

## 📈 Future Enhancements

### Planned Features:

1. **Bulk Discounts**: Automatic discounts for large quantities
2. **Seasonal Pricing**: Time-based variant pricing
3. **Customer Groups**: Different pricing for different customer types
4. **Analytics**: Track which variants sell best

## 📞 Support

For technical support or questions about the Product Variants system:

1. Check this guide first
2. Review the database migration script
3. Test with sample data
4. Contact the development team

---

**🎉 Congratulations!** You now have a powerful, flexible pricing system that can handle the complex needs of modern pharmacy operations.
