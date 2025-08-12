# 🏥 MedCure Database Setup Guide

## Complete Database Schema & Configuration

---

## 📋 TABLE OF CONTENTS

1. [Database Tables](#database-tables)
2. [Storage Buckets](#storage-buckets)
3. [Storage Policies](#storage-policies)
4. [Setup Instructions](#setup-instructions)
5. [Quick Start](#quick-start)

---

## 🗄️ DATABASE TABLES

### 1. Products Table

**Purpose**: Stores all medicine and product inventory information

```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  expireDate DATE,
  productType TEXT,
  description TEXT,
  status TEXT DEFAULT 'Available',
  medicineId TEXT
);
```

### 2. Product Variants Table (NEW)

**Purpose**: Stores different pricing units for products (box, sheet, piece)

```sql
CREATE TABLE product_variants (
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
```

### 3. Sales Table

**Purpose**: Records each sale transaction

```sql
CREATE TABLE sales (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_amount NUMERIC NOT NULL,
  discount_applied BOOLEAN DEFAULT FALSE
);
```

### 4. Sale Items Table

**Purpose**: Links products to sales (many-to-many relationship)

```sql
CREATE TABLE sale_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sale_id BIGINT,
  product_id BIGINT,
  variant_id BIGINT,
  quantity INTEGER NOT NULL,
  unit_type TEXT NOT NULL,
  price_at_sale NUMERIC NOT NULL,
  CONSTRAINT fk_sale FOREIGN KEY(sale_id) REFERENCES sales(id),
  CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES products(id),
  CONSTRAINT fk_variant FOREIGN KEY(variant_id) REFERENCES product_variants(id)
);
```

### 5. Branding Table

**Purpose**: Stores pharmacy branding information

```sql
CREATE TABLE branding (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  logo_url TEXT
);
```

### 6. Avatars Table

**Purpose**: Stores user avatar images

```sql
CREATE TABLE avatars (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fileName TEXT,
  url TEXT
);
```

---

## 🗂️ STORAGE BUCKETS

### Required Buckets

Create these storage buckets in your Supabase project:

1. **`logos`** - Company logos and branding images
2. **`avatars`** - User profile pictures

---

## 🔐 STORAGE POLICIES

### Logo Storage Policies

#### Allow Authenticated Users to Upload Logos

```sql
CREATE POLICY "Allow authenticated users to upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');
```

### Avatar Storage Policies

#### 1. Public Read Access to All Avatars

```sql
CREATE POLICY "Allow public read on avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );
```

#### 2. Users Can Upload Their Own Avatar

```sql
CREATE POLICY "Allow insert for own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );
```

#### 3. Users Can Update Their Own Avatar

```sql
CREATE POLICY "Allow update for own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' );
```

#### 4. Users Can Delete Their Own Avatar

```sql
CREATE POLICY "Allow delete for own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Database Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste each table creation script above
4. Run them one by one in order

### Step 2: Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Click **"New Bucket"**
3. Create bucket named `logos`
4. Create bucket named `avatars`
5. Set both to **Public** for now (policies will handle access control)

### Step 3: Apply Storage Policies

1. Go to **SQL Editor** again
2. Copy and paste each storage policy script above
3. Run them one by one

### Step 4: Insert Initial Branding Data

```sql
INSERT INTO branding (id, name, logo_url)
VALUES (1, 'MedCure', 'https://your-project.supabase.co/storage/v1/object/public/logos/default-logo.png');
```

---

## ⚡ QUICK START

### Complete Setup in 5 Minutes

```sql
-- 1. Create all tables at once
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  expireDate DATE,
  productType TEXT,
  description TEXT,
  status TEXT DEFAULT 'Available',
  medicineId TEXT
);

CREATE TABLE product_variants (
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

CREATE TABLE sales (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_amount NUMERIC NOT NULL,
  discount_applied BOOLEAN DEFAULT FALSE
);

CREATE TABLE sale_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sale_id BIGINT,
  product_id BIGINT,
  variant_id BIGINT,
  quantity INTEGER NOT NULL,
  unit_type TEXT NOT NULL,
  price_at_sale NUMERIC NOT NULL,
  CONSTRAINT fk_sale FOREIGN KEY(sale_id) REFERENCES sales(id),
  CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES products(id),
  CONSTRAINT fk_variant FOREIGN KEY(variant_id) REFERENCES product_variants(id)
);

CREATE TABLE branding (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  logo_url TEXT
);

CREATE TABLE avatars (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fileName TEXT,
  url TEXT
);
```

-- 2. Insert default branding
INSERT INTO branding (id, name, logo_url)
VALUES (1, 'MedCure', 'https://your-project.supabase.co/storage/v1/object/public/logos/default-logo.png');

-- 3. Create storage buckets (do this in Storage section)
-- 4. Apply storage policies (run the policy scripts above)

````

---

## 🔍 VERIFICATION

### Check if Tables Were Created

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
````

### Check if Branding Data Exists

```sql
SELECT * FROM branding;
```

---

## 📝 NOTES

- **Order Matters**: Create tables before inserting data
- **Foreign Keys**: Sale items reference both sales and products
- **Default Values**: Products default to 'Available' status
- **Timestamps**: Sales automatically get creation timestamps
- **Storage**: Policies ensure secure access to files

---

## 🆘 TROUBLESHOOTING

### Common Issues

1. **Foreign Key Error**: Make sure tables exist before creating constraints
2. **Policy Error**: Verify bucket names match exactly
3. **Permission Error**: Check if you're authenticated in Supabase

### Need Help?

- Check Supabase logs in the dashboard
- Verify all SQL scripts ran successfully
- Ensure storage buckets are created before applying policies
