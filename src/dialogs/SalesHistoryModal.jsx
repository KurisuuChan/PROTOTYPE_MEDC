import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Printer, Loader2 } from "lucide-react";
import { generateReceiptPDF } from "@/utils/pdf";
import * as api from "@/services/api";

const SalesHistoryModal = ({ isOpen, onClose, branding }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchSales = async () => {
        setLoading(true);
        const { data, error } = await api.getSalesHistory();

        if (error) {
          console.error("Error fetching sales history:", error);
        } else {
          setSales(data);
        }
        setLoading(false);
      };
      fetchSales();
    }
  }, [isOpen]);

  const handlePrintReceipt = async (sale) => {
    await generateReceiptPDF(sale, branding);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      );
    }

    if (sales.length === 0) {
      return (
        <p className="text-center text-gray-500">No sales history found.</p>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sale ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Variants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discount
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {sale.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.sale_items
                  .map((item) => item.products?.name || "Unknown Product")
                  .join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.sale_items
                  .map((item) => {
                    if (item.product_variants) {
                      return `${item.quantity} ${item.product_variants.unit_type} @ ₱${item.price_at_sale}`;
                    } else {
                      return `${item.quantity} units @ ₱${item.price_at_sale}`;
                    }
                  })
                  .join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(sale.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(sale.created_at).toLocaleTimeString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₱{sale.total_amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sale.discount_applied ? "Yes" : "No"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button
                  onClick={() => handlePrintReceipt(sale)}
                  className="text-blue-600 hover:text-blue-900 flex items-center gap-1 mx-auto"
                >
                  <Printer size={16} /> Print Receipt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

SalesHistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branding: PropTypes.object.isRequired,
};

export default SalesHistoryModal;
