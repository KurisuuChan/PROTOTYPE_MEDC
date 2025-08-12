import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "@/supabase/client";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { generateProductPDF } from "@/utils/pdfUtils"; // Updated import path

const ExportPDFModal = ({ isOpen, onClose, allProducts }) => {
  const [status, setStatus] = useState("generating");

  useEffect(() => {
    if (isOpen) {
      const createReport = async () => {
        try {
          setStatus("generating");
          const { data: brandingData, error: brandingError } = await supabase
            .from("branding")
            .select("name, logo_url")
            .eq("id", 1)
            .single();
          if (brandingError) throw brandingError;

          const result = await generateProductPDF(allProducts, brandingData);
          if (result.success) {
            setStatus("success");
            setTimeout(() => {
              onClose();
              setStatus("generating"); // Reset for next time
            }, 2000);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          console.error("PDF generation failed:", err);
          setStatus("error");
        }
      };
      createReport();
    }
  }, [isOpen, allProducts, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
        {status === "generating" && (
          <>
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Generating Report
            </h3>
            <p className="mt-2 text-gray-500">
              Please wait while we prepare your PDF...
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Report Generated!
            </h3>
            <p className="mt-2 text-gray-500">
              Your download will begin shortly.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Export Failed
            </h3>
            <p className="mt-2 text-gray-500">
              Something went wrong. Please check the console for details.
            </p>
            <button
              onClick={() => {
                onClose();
                setStatus("generating");
              }}
              className="mt-6 px-4 py-2 bg-gray-200 rounded-lg font-semibold"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

ExportPDFModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  allProducts: PropTypes.array.isRequired,
};

export default ExportPDFModal;
