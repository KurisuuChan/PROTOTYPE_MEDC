// src/dialogs/SalesHistoryModal.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  Printer,
  Loader2,
  ChevronDown,
  ChevronUp,
  Hash,
  Calendar,
  ShoppingCart,
  Tag,
  Receipt,
} from "lucide-react";
import { generateReceiptPDF } from "@/utils/pdf";
import * as api from "@/services/api";

const SaleDetailRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className="text-gray-500">{icon}</div>
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value}</span>
  </div>
);

SaleDetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

const SaleCard = ({ sale, onPrint }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalItems = sale.sale_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="border border-gray-200 rounded-xl bg-white transition-all duration-300 hover:shadow-lg hover:border-blue-400">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`sale-details-${sale.id}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <SaleDetailRow
            label="Sale ID"
            value={sale.id.toString()}
            icon={<Hash size={14} />}
          />
          <SaleDetailRow
            label="Date"
            value={new Date(sale.created_at).toLocaleDateString()}
            icon={<Calendar size={14} />}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg text-blue-600">
            ₱{sale.total_amount.toFixed(2)}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          id={`sale-details-${sale.id}`}
          className="border-t border-gray-200 p-4 bg-gray-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <SaleDetailRow
              label="Time"
              value={new Date(sale.created_at).toLocaleTimeString()}
              icon={<Calendar size={14} />}
            />
            <SaleDetailRow
              label="Total Items"
              value={totalItems.toString()}
              icon={<ShoppingCart size={14} />}
            />
            <SaleDetailRow
              label="Discount Applied"
              value={sale.discount_applied ? "Yes" : "No"}
              icon={<Tag size={14} />}
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Items Sold</h4>
            <ul className="divide-y divide-gray-200">
              {sale.sale_items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-2"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.products?.name || "Unknown Product"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {" "}
                      (
                      {item.product_variants?.unit_type ||
                        "unit".toLocaleLowerCase()}
                      )
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800">
                      {item.quantity} x ₱{item.price_at_sale.toFixed(2)}
                    </p>
                    <p className="font-bold text-gray-900">
                      ₱{(item.quantity * item.price_at_sale).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={() => onPrint(sale)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

SaleCard.propTypes = {
  sale: PropTypes.object.isRequired,
  onPrint: PropTypes.func.isRequired,
};

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
          setSales(data || []);
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
        <div className="text-center py-20 text-gray-500">
          <Receipt size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">No Sales Recorded</h2>
          <p className="text-md">
            When a sale is completed, it will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} onPrint={handlePrintReceipt} />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 p-6 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b bg-gray-50 sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
            <p className="text-sm text-gray-500">
              A log of all completed transactions.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {sales.length} Total Sales
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {renderContent()}
        </div>
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
