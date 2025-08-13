// src/pages/Management.jsx
import React, { useEffect } from "react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { usePagination } from "@/hooks/usePagination.jsx";
import { useNotification } from "@/hooks/useNotifications"; // Corrected import path
import { useManagement } from "@/hooks/useManagement";

import AddProductModal from "@/dialogs/AddProductModal";
import EditProductModal from "@/dialogs/EditProductModal";
import ViewProductModal from "@/dialogs/ViewProductModal";
import ImportCSVModal from "@/dialogs/ImportCSVModal";
import ExportPDFModal from "@/dialogs/ExportPDFModal";

import ManagementHeader from "./modules/ManagementHeader";
import ProductFilters from "./modules/ProductFilters";
import ProductTable, { MobileProductCards } from "./modules/ProductTable";
import { WifiOff, RefreshCw } from "lucide-react";

const Management = () => {
  const { addNotification } = useNotification();
  const {
    filteredProducts,
    selectedItems,
    setSelectedItems,
    loading,
    error,
    modals,
    selectedProduct,
    activeFilters,
    highlightedRow,
    fetchProducts,
    handleArchiveSelected,
    handleFilterChange,
    openModal,
    closeModal,
  } = useManagement(addNotification);

  const { searchTerm, setSearchTerm, searchedProducts } =
    useProductSearch(filteredProducts);

  const {
    paginatedData: paginatedProducts,
    PaginationComponent,
    ItemsPerPageComponent,
    setCurrentPage,
  } = usePagination(searchedProducts);

  // When filters change, reset pagination to the first page
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchTerm, setCurrentPage]);

  // ... rest of the component remains the same

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem fetching the data. Please check your internet
          connection.
        </p>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );

  return (
    <>
      <AddProductModal
        isOpen={modals.add}
        onClose={() => closeModal("add")}
        onProductAdded={fetchProducts}
      />
      <ImportCSVModal
        isOpen={modals.import}
        onClose={() => closeModal("import")}
        onImportSuccess={fetchProducts}
      />
      <ExportPDFModal
        isOpen={modals.export}
        onClose={() => closeModal("export")}
        allProducts={filteredProducts}
      />
      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={modals.edit}
            onClose={() => closeModal("edit")}
            product={selectedProduct}
            onProductUpdated={fetchProducts}
          />
          <ViewProductModal
            isOpen={modals.view}
            onClose={() => closeModal("view")}
            product={selectedProduct}
          />
        </>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg font-sans">
        <ManagementHeader
          selectedItemsCount={selectedItems.length}
          onAddProduct={() => openModal("add")}
          onArchiveSelected={handleArchiveSelected}
          onImport={() => openModal("import")}
          onExport={() => openModal("export")}
        />
        <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-gray-200 mb-6">
          <ProductFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
          <ItemsPerPageComponent />
        </div>

        <ProductTable
          products={paginatedProducts}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchedProducts={searchedProducts}
          onViewProduct={(product) => openModal("view", product)}
          onEditProduct={(product) => openModal("edit", product)}
          highlightedRow={highlightedRow}
        />
        <MobileProductCards
          products={paginatedProducts}
          selectedItems={selectedItems}
          handleSelectItem={(id) =>
            setSelectedItems((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          onViewProduct={(product) => openModal("view", product)}
          onEditProduct={(product) => openModal("edit", product)}
        />
        <PaginationComponent />
      </div>
    </>
  );
};

export default Management;
