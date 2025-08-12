-- MedCure Database Migration: Add Product Variants Support
-- Run this script to add support for different pricing units (box, sheet, piece)

-- 1. Create the product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('box', 'sheet', 'piece')),
  unit_price NUMERIC NOT NULL,
  units_per_variant INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_product_variant FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_product_unit UNIQUE(product_id, unit_type)
);

-- 2. Add new columns to sale_items table
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS variant_id BIGINT,
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'piece';

-- 3. Add foreign key constraint for variant_id (with proper error handling)
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_variant' 
    AND table_name = 'sale_items'
  ) THEN
    -- Add the constraint only if it doesn't exist
    ALTER TABLE sale_items 
    ADD CONSTRAINT fk_variant 
    FOREIGN KEY(variant_id) REFERENCES product_variants(id);
  END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_unit_type ON product_variants(unit_type);
CREATE INDEX IF NOT EXISTS idx_sale_items_variant_id ON sale_items(variant_id);

-- 5. Insert default variants for existing products (optional)
-- This will create a piece variant for all existing products based on their current price
INSERT INTO product_variants (product_id, unit_type, unit_price, units_per_variant, is_default)
SELECT 
  id as product_id,
  'piece' as unit_type,
  price as unit_price,
  1 as units_per_variant,
  TRUE as is_default
FROM products 
WHERE id NOT IN (SELECT DISTINCT product_id FROM product_variants);

-- 6. Update existing sale_items to use 'piece' as default unit_type
UPDATE sale_items 
SET unit_type = 'piece' 
WHERE unit_type IS NULL;

-- 7. Create a view for easier product variant queries
CREATE OR REPLACE VIEW products_with_variants AS
SELECT 
  p.*,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', pv.id,
        'unit_type', pv.unit_type,
        'unit_price', pv.unit_price,
        'units_per_variant', pv.units_per_variant,
        'is_default', pv.is_default
      )
    ) FROM product_variants pv WHERE pv.product_id = p.id),
    '[]'::json
  ) as product_variants
FROM products p;

-- 8. Create a function to get product variants
CREATE OR REPLACE FUNCTION get_product_variants(product_id_param BIGINT)
RETURNS TABLE(
  id BIGINT,
  unit_type TEXT,
  unit_price NUMERIC,
  units_per_variant INTEGER,
  is_default BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id,
    pv.unit_type,
    pv.unit_price,
    pv.units_per_variant,
    pv.is_default
  FROM product_variants pv
  WHERE pv.product_id = product_id_param
  ORDER BY pv.unit_type;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a function to get default variant price
CREATE OR REPLACE FUNCTION get_default_variant_price(product_id_param BIGINT)
RETURNS NUMERIC AS $$
DECLARE
  default_price NUMERIC;
BEGIN
  SELECT pv.unit_price INTO default_price
  FROM product_variants pv
  WHERE pv.product_id = product_id_param AND pv.is_default = TRUE
  LIMIT 1;
  
  RETURN COALESCE(default_price, 0);
END;
$$ LANGUAGE plpgsql;

-- 10. Add comments for documentation
COMMENT ON TABLE product_variants IS 'Stores different pricing units for products (box, sheet, piece)';
COMMENT ON COLUMN product_variants.unit_type IS 'Type of unit: box, sheet, or piece';
COMMENT ON COLUMN product_variants.unit_price IS 'Price for this specific unit type';
COMMENT ON COLUMN product_variants.units_per_variant IS 'How many base units are in this variant (e.g., 10 pieces per box)';
COMMENT ON COLUMN product_variants.is_default IS 'Whether this is the default pricing option';

-- Migration completed successfully!
-- You can now use the enhanced product variant system in your MedCure application.
