// src/services/api.js
import { supabase } from "@/supabase/client";

// ADDED EXPORT
export { supabase };

// --- ADD THIS NEW FUNCTION ---
// Notifications
export const addNotification = (notificationData) =>
  supabase.from("notifications").insert([notificationData]);
// ----------------------------

// Authentication
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();
export const getSession = () => supabase.auth.getSession();
export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);
export const getUser = () => supabase.auth.getUser();
export const updateUser = (userData) => supabase.auth.updateUser(userData);

// Products
export const getProducts = () =>
  supabase
    .from("products")
    .select("*, product_variants(*)")
    .neq("status", "Archived");

export const getArchivedProducts = () =>
  supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("status", "Archived");

export const getProductById = (id) =>
  supabase.from("products").select("*").eq("id", id).single();

export const addProduct = (productData) =>
  supabase.from("products").insert([productData]);

export const updateProduct = (id, productData) =>
  supabase.from("products").update(productData).eq("id", id);

export const deleteProduct = (id) =>
  supabase.from("products").delete().eq("id", id);

export const getAvailableProducts = () =>
  supabase
    .from("products")
    .select(
      `
      *,
      product_variants (
        id,
        unit_type,
        unit_price,
        units_per_variant,
        is_default
      )
    `
    )
    .eq("status", "Available")
    .gt("quantity", 0);

// Alias for backward compatibility
export const getAvailableProductsWithVariants = getAvailableProducts;

export const insertProducts = (products) =>
  supabase.from("products").insert(products);

// Product Variants
export const getProductVariants = (productId) =>
  supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("unit_type");

export const addProductVariant = (variantData) =>
  supabase.from("product_variants").insert([variantData]);

export const updateProductVariant = (id, variantData) =>
  supabase.from("product_variants").update(variantData).eq("id", id);

export const deleteProductVariant = (id) =>
  supabase.from("product_variants").delete().eq("id", id);

export const getDefaultVariant = (productId) =>
  supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_default", true)
    .single();

// Bulk operations
export const archiveProducts = (ids) =>
  supabase.from("products").update({ status: "Archived" }).in("id", ids);

// Sales
export const getSales = () =>
  supabase.from("sales").select("*").order("created_at", { ascending: false });

export const getSalesHistory = () =>
  supabase
    .from("sales")
    .select(
      `
      *,
      sale_items (
        *,
        products (name),
        product_variants (unit_type, unit_price)
      )
    `
    )
    .order("created_at", { ascending: false });

export const addSale = (saleData) =>
  supabase.from("sales").insert([saleData]).select().single();

export const getSaleItems = (saleId) =>
  supabase
    .from("sale_items")
    .select(
      `
      *,
      products (name),
      product_variants (unit_type, unit_price)
    `
    )
    .eq("sale_id", saleId);

export const addSaleItems = (saleItemsData) =>
  supabase.from("sale_items").insert(saleItemsData);

// Sale Items
export const getRecentSaleItems = () =>
  supabase
    .from("sale_items")
    .select("*, products(name), sales(created_at)")
    .order("id", { ascending: false })
    .limit(5);

export const getAllSaleItems = () =>
  supabase
    .from("sale_items")
    .select(
      "quantity, price_at_sale, sales(created_at), products (name, category, cost_price)"
    );

// Branding
export const getBranding = () =>
  supabase.from("branding").select("*").eq("id", 1).single();

export const updateBranding = (brandingData) =>
  supabase.from("branding").update(brandingData).eq("id", 1);

// Avatars
export const getAvatars = () =>
  supabase
    .from("avatars")
    .select("*")
    .order("created_at", { ascending: false });

export const addAvatar = (avatarData) =>
  supabase.from("avatars").insert([avatarData]);

export const deleteAvatar = (id) =>
  supabase.from("avatars").delete().eq("id", id);

// Storage
export const uploadFile = (bucket, path, file) =>
  supabase.storage.from(bucket).upload(path, file);
export const getPublicUrl = (bucket, path) =>
  supabase.storage.from(bucket).getPublicUrl(path);

// Financials
export const resetFinancials = async () => {
  const { error: itemsError } = await supabase
    .from("sale_items")
    .delete()
    .gt("id", 0);
  if (itemsError) return { error: itemsError };

  const { error: salesError } = await supabase
    .from("sales")
    .delete()
    .gt("id", 0);
  if (salesError) return { error: salesError };

  return { error: null };
};
