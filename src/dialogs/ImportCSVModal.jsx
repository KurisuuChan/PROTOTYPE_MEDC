import React, { useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "@/supabase/client";
import { UploadCloud, FileText, X, Download } from "lucide-react";
import { useNotification } from "@/hooks/useNotifications";
import { addSystemNotification } from "@/utils/notificationStorage";

// Helper to create a single variant entry
const createVariantEntry = (unitType, price, units, isDefault = false) => {
  if (price && Number(price) > 0) {
    return {
      unit_type: unitType,
      unit_price: Number(price),
      units_per_variant: Number(units) || 1,
      is_default: isDefault,
    };
  }
  return null;
};

// Helper to generate a unique Medicine ID
const generateMedicineId = (nextId, productType, datePart) => {
  const typePart = productType === "Medicine" ? "1" : "0";
  return `${datePart}${typePart}${nextId}`;
};

// Helper to parse a single line from the CSV into a product and its variants
const parseCsvLine = (line, headers, startingId, datePart) => {
  if (!line) return null;

  const values = line.split(",");
  const entry = {};
  headers.forEach((header, index) => {
    const value = values[index] ? values[index].trim() : null;
    entry[header] = value;
  });

  const medicineId = generateMedicineId(
    startingId,
    entry.productType,
    datePart
  );
  const numericQty = Number(entry.quantity) || 0;

  // Create variants from CSV data
  const variants = [
    createVariantEntry("box", entry.boxPrice, entry.boxUnits),
    createVariantEntry("sheet", entry.sheetPrice, entry.sheetUnits),
    createVariantEntry("piece", entry.piecePrice, entry.pieceUnits),
  ].filter(Boolean); // Remove null entries

  // Fallback to main price if piecePrice is not provided
  if (!entry.piecePrice && entry.price) {
    variants.push(createVariantEntry("piece", entry.price, 1));
  }

  // Ensure one variant is default
  if (variants.length > 0) {
    const pieceVariant = variants.find((v) => v.unit_type === "piece");
    if (pieceVariant) {
      pieceVariant.is_default = true;
    } else {
      variants[0].is_default = true; // Default to the first available variant
    }
  }

  const defaultPrice =
    Number(variants.find((v) => v.is_default)?.unit_price || entry.price) || 0;

  const productData = {
    product: {
      name: entry.name,
      category: entry.category,
      quantity: numericQty,
      price: defaultPrice,
      cost_price: Number(entry.cost_price) || 0,
      expireDate: entry.expireDate,
      productType: entry.productType,
      description: entry.description,
      supplier: entry.supplier, // <-- ADDED THIS LINE
      medicineId: medicineId,
      status: numericQty > 0 ? "Available" : "Unavailable",
    },
    variants: variants,
  };

  return productData;
};

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

  const parseProductsWithVariants = (csvText, startingId) => {
    const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== "");
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const productLines = lines.slice(1);
    const today = new Date();
    const datePart = `${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate()
    ).padStart(2, "0")}${today.getFullYear()}`;

    return productLines
      .map((line, index) =>
        parseCsvLine(line, headers, startingId + index, datePart)
      )
      .filter(Boolean);
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
          // Ignore "PGRST116" which means no rows found (table is empty)
          throw fetchError;
        }

        const nextId = lastProduct ? lastProduct.id + 1 : 1;
        const csvText = event.target.result;

        const productsToProcess = parseProductsWithVariants(csvText, nextId);

        if (productsToProcess.length === 0) {
          setError("CSV file is empty or invalid.");
          setLoading(false);
          return;
        }

        // Insert products and then their variants
        for (const item of productsToProcess) {
          const { data: insertedProduct, error: productError } = await supabase
            .from("products")
            .insert(item.product)
            .select("id")
            .single();

          if (productError) throw productError;

          if (item.variants.length > 0) {
            const variantsToInsert = item.variants.map((v) => ({
              ...v,
              product_id: insertedProduct.id,
            }));

            const { error: variantsError } = await supabase
              .from("product_variants")
              .insert(variantsToInsert);

            if (variantsError) throw variantsError;
          }
        }

        addSystemNotification({
          id: `csv-${Date.now()}`,
          iconType: "upload",
          iconBg: "bg-green-100",
          title: "CSV Import Successful",
          category: "System",
          description: `${productsToProcess.length} products were successfully imported.`,
          createdAt: new Date().toISOString(),
          path: "/management",
        });

        addNotification(
          `${productsToProcess.length} products imported successfully!`,
          "success"
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
    // UPDATED CSV CONTENT
    const csvContent = `name,category,supplier,quantity,price,cost_price,expireDate,productType,description,boxPrice,boxUnits,sheetPrice,sheetUnits,piecePrice,pieceUnits
Paracetamol 500mg,Pain Relief,PharmaCorp,100,5.00,2.50,2025-12-31,Medicine,Generic pain reliever,45.00,10,9.00,2,5.00,1
Amoxicillin 250mg,Prescription,MedSupply Inc.,50,8.50,4.00,2025-06-30,Medicine,Antibiotic,76.50,9,17.00,2,8.50,1
Vitamin C 1000mg,Vitamins & Supplements,HealthWell,200,3.00,1.20,2026-01-31,Supplement,Immune support,27.00,9,6.00,2,3.00,1`;

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
            <strong>Columns:</strong> <code>name</code>, <code>category</code>,{" "}
            <code>supplier</code>, <code>quantity</code>, <code>price</code>{" "}
            (for default/piece), <code>cost_price</code>,{" "}
            <code>expireDate</code>, <code>productType</code>,{" "}
            <code>description</code>, and optional variant columns like{" "}
            <code>boxPrice</code>, <code>sheetPrice</code>, etc.
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
