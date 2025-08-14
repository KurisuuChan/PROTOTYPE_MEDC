// src/pages/Archived.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Archive,
  RotateCcw,
  PackageX,
  Trash2,
  Search,
  WifiOff,
  RefreshCw,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";
import { useNotification } from "@/hooks/useNotifications";
import { useProductSearch } from "@/hooks/useProductSearch";
import { usePagination } from "@/hooks/usePagination.jsx";
import { useArchivedProducts } from "@/hooks/useArchivedProducts"; // <-- Import the new hook

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
            <AlertTriangle
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-0 text-left">
            <h3 className="text-lg leading-6 font-bold text-gray-900">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            onClick={onConfirm}
          >
            Confirm & Delete
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

const Archived = () => {
  const { addNotification } = useNotification();
  const {
    archivedProducts,
    isLoading,
    isError,
    unarchiveProducts,
    deleteProductsPermanently,
  } = useArchivedProducts(addNotification);

  const [selectedItems, setSelectedItems] = useState([]);
  const { searchTerm, setSearchTerm, searchedProducts } =
    useProductSearch(archivedProducts);
  const { paginatedData, PaginationComponent } =
    usePagination(searchedProducts);
  const [viewMode, setViewMode] = useState("grid");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? searchedProducts.map((p) => p.id) : []);
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = () => {
    if (selectedItems.length > 0) setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteProductsPermanently(selectedItems, {
      onSuccess: () => setSelectedItems([]),
    });
    setDeleteModalOpen(false);
  };

  const handleUnarchive = () => {
    unarchiveProducts(selectedItems, { onSuccess: () => setSelectedItems([]) });
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold">Connection Error</h2>
        <p className="text-gray-600 mb-6">Could not fetch archived data.</p>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete Products?"
        message={`You are about to delete ${selectedItems.length} product(s). This is irreversible. Are you sure?`}
      />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-100">
              <Archive size={32} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Archive</h1>
              <p className="text-gray-500">
                {archivedProducts.length} archived products
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search archived..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-gray-100 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full ${
                  viewMode === "grid" ? "bg-white shadow" : "text-gray-500"
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full ${
                  viewMode === "list" ? "bg-white shadow" : "text-gray-500"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-800 flex-grow">
              {selectedItems.length} selected
            </p>
            <button
              onClick={handleUnarchive}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold"
            >
              <RotateCcw size={16} /> Restore
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}

        {/* Content */}
        {paginatedData.length > 0 ? (
          <div>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      selectedItems.includes(product.id)
                        ? "bg-blue-50 border-blue-400"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectItem(product.id)}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg flex-grow">
                        {product.name}
                      </h3>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        readOnly
                        className="rounded border-gray-300 text-blue-600 ml-4 pointer-events-none"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {product.category}
                    </p>
                    <div className="text-sm space-y-2 border-t pt-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        <span className="font-semibold">Archived:</span>
                        <span>{formatDate(product.updated_at)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <input type="checkbox" onChange={handleSelectAll} />
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Archived On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((product) => (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        selectedItems.includes(product.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={() => handleSelectItem(product.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(product.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <PaginationComponent />
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <PackageX size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">No Archived Products</h2>
            <p>
              {searchTerm
                ? `No results found for "${searchTerm}".`
                : "The archive is currently empty."}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Archived;
