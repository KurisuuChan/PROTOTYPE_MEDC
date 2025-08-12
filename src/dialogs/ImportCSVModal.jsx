import React, { useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "@/supabase/client";
import { UploadCloud, FileText, X, Download } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { addSystemNotification } from "@/utils/notificationStorage";

const ImportCSVModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    } else {
      setFile(null);
      setFileName("");
      setError("Please select a valid .csv file.");
    }
  };

  const generateMedicineId = (nextId, productType, datePart) => {
    const typePart = productType === "Medicine" ? "1" : "0";
    return `${datePart}${typePart}${nextId}`;
  };

  const parseAndPrepareData = (csvText, startingId) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== "");
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((header) => header.trim());
    const data = [];
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const datePart = `${month}${day}${year}`;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const values = lines[i].split(",");
      const entry = {};
      headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : null;
        if (["quantity", "price"].includes(header) && value) {
          entry[header] = Number(value);
        } else {
          entry[header] = value;
        }
      });

      const nextId = startingId + i - 1;
      entry.medicineId = generateMedicineId(
        nextId,
        entry.productType,
        datePart
      );
      entry.status = "Available";

      data.push(entry);
    }
    return data;
  };

  const createVariantEntry = (productId, unitType, price, units, isDefault) => {
    if (price && price > 0) {
      return {
        product_id: productId, // Can be null initially
        unit_type: unitType,
        unit_price: Number(price),
        units_per_variant: units || 1,
        is_default: isDefault,
      };
    }
    return null;
  };

  const parseVariantsData = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== "");
    if (lines.length <= 1) return { products: [], variants: [] };

    const headers = lines[0].split(",").map((header) => header.trim());
    const products = [];
    const variants = [];
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    const datePart = `${month}${day}${year}`;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const values = lines[i].split(",");
      const entry = {};
      headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : null;
        if (["quantity", "price"].includes(header) && value) {
          entry[header] = Number(value);
        } else {
          entry[header] = value;
        }
      });

      const medicineId = generateMedicineId(i, entry.productType, datePart);

      // Create product entry
      const numericQty = Number(entry.quantity) || 0;
      const productEntry = {
        name: entry.name,
        category: entry.category,
        quantity: numericQty,
        price: entry.price || 0,
        expireDate: entry.expireDate,
        productType: entry.productType,
        description: entry.description,
        medicineId: medicineId,
        status: numericQty > 0 ? "Available" : "Unavailable",
      };
      products.push(productEntry);

      // Create variants (we'll set product_id after insertion)
      const boxVariant = createVariantEntry(
        null, // Will be set after product insertion
        "box",
        entry.boxPrice,
        entry.boxUnits,
        false
      );
      const sheetVariant = createVariantEntry(
        null, // Will be set after product insertion
        "sheet",
        entry.sheetPrice,
        entry.sheetUnits,
        false
      );
      const pieceVariant = createVariantEntry(
        null, // Will be set after product insertion
        "piece",
        entry.piecePrice,
        entry.pieceUnits,
        true
      );

      if (boxVariant) variants.push(boxVariant);
      if (sheetVariant) variants.push(sheetVariant);
      if (pieceVariant) {
        variants.push(pieceVariant);
      } else if (entry.price && entry.price > 0) {
        // Use main price as piece price if no specific piece price
        variants.push(createVariantEntry(null, "piece", entry.price, 1, true));
      }
    }

    return { products, variants };
  };

  const insertProductsAndVariants = async (
    productsToInsert,
    variantsToInsert
  ) => {
    // Insert products first and get their IDs
    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select("id");

    if (insertError) {
      throw insertError;
    }

    // Insert variants if they exist, using the actual product IDs
    if (variantsToInsert.length > 0) {
      // Create a map of product index to product ID
      const productIdMap = {};
      productsToInsert.forEach((product, index) => {
        productIdMap[index] = insertedProducts[index].id;
      });

      // Update variant product_ids using the map
      const updatedVariants = variantsToInsert.map((variant, index) => {
        // Find which product this variant belongs to
        // Since variants are created in order for each product, we can calculate this
        const productIndex = Math.floor(index / 3); // Each product has max 3 variants
        return {
          ...variant,
          product_id: productIdMap[productIndex],
        };
      });

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(updatedVariants);

      if (variantsError) {
        throw variantsError;
      }
    }
  };

  const createSuccessNotification = (productsCount, variantsCount) => {
    const description = `${productsCount} products were successfully imported${
      variantsCount > 0 ? ` with ${variantsCount} pricing variants` : ""
    }.`;

    addSystemNotification({
      id: `csv-${Date.now()}`,
      iconType: "upload",
      iconBg: "bg-green-100",
      title: "CSV Import Successful",
      category: "System",
      description,
      createdAt: new Date().toISOString(),
      path: "/management",
    });

    addNotification(
      `${productsCount} products imported successfully!${
        variantsCount > 0 ? ` (${variantsCount} variants)` : ""
      }`,
      "success"
    );
  };

  const handleImport = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const { data: lastProduct, error: fetchError } = await supabase
          .from("products")
          .select("id")
          .order("id", { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        const nextId = lastProduct ? lastProduct.id + 1 : 1;

        // Check if CSV has variant columns
        const csvText = event.target.result;
        const hasVariants =
          csvText.includes("boxPrice") ||
          csvText.includes("sheetPrice") ||
          csvText.includes("piecePrice");

        let productsToInsert, variantsToInsert;

        if (hasVariants) {
          const parsedData = parseVariantsData(csvText);
          productsToInsert = parsedData.products;
          variantsToInsert = parsedData.variants;
        } else {
          // Fallback to old format
          productsToInsert = parseAndPrepareData(csvText, nextId);
          variantsToInsert = [];
        }

        if (productsToInsert.length === 0) {
          setError("CSV file is empty or invalid.");
          setLoading(false);
          return;
        }

        await insertProductsAndVariants(productsToInsert, variantsToInsert);
        createSuccessNotification(
          productsToInsert.length,
          variantsToInsert.length
        );

        onImportSuccess();
        handleClose();
      } catch (e) {
        const errorMessage = `Import failed: ${e.message}`;
        setError(errorMessage);
        addNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = `name,category,quantity,price,expireDate,productType,description,boxPrice,boxUnits,sheetPrice,sheetUnits,piecePrice,pieceUnits
Paracetamol 500mg,Pain Relief,100,5.00,2025-12-31,Medicine,Generic pain reliever,45.00,10,9.00,2,5.00,1
Amoxicillin 250mg,Prescription,50,8.50,2025-06-30,Medicine,Antibiotic,76.50,9,17.00,2,8.50,1
Vitamin C 1000mg,Vitamins & Supplements,200,3.00,2026-01-31,Supplement,Immune support,27.00,9,6.00,2,3.00,1`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setFileName("");
    setError("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Import Products from CSV
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Enhanced CSV Import with Variants
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              You can now import products with different pricing units (box,
              sheet, piece). Download the template below to see the new format.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download size={16} />
              Download Template
            </button>
          </div>

          <p className="text-sm text-gray-600">
            <strong>New Format:</strong> Include columns for variant pricing:{" "}
            <code>boxPrice</code>, <code>boxUnits</code>,{" "}
            <code>sheetPrice</code>, <code>sheetUnits</code>,{" "}
            <code>piecePrice</code>, <code>pieceUnits</code>
          </p>

          <p className="text-sm text-gray-600">
            <strong>Legacy Format:</strong> Basic columns: <code>name</code>,{" "}
            <code>category</code>, <code>quantity</code>, <code>price</code>,{" "}
            <code>expireDate</code>, <code>productType</code>,{" "}
            <code>description</code>
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <UploadCloud size={48} className="text-gray-400 mb-2" />
              <span className="text-blue-600 font-semibold">
                Click to upload
              </span>
              <span className="text-gray-500 text-sm">or drag and drop</span>
              <span className="text-xs text-gray-400 mt-1">CSV files only</span>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {fileName && (
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {fileName}
                </span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setFileName("");
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!file || loading}
          >
            {loading ? "Importing..." : "Import Products"}
          </button>
        </div>
      </div>
    </div>
  );
};

ImportCSVModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImportSuccess: PropTypes.func.isRequired,
};

export default ImportCSVModal;
