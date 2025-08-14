// src/pages/Management.jsx
import React, { useState, useEffect } from "react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { usePagination } from "@/hooks/usePagination.jsx";
import { useNotification } from "@/hooks/useNotifications";
import { useProducts } from "@/hooks/useProducts"; // <-- Import the new hook

// Modals and other components remain the same
import AddProductModal from "@/dialogs/AddProductModal";
import EditProductModal from "@/dialogs/EditProductModal";
import ViewProductModal from "@/dialogs/ViewProductModal";
import ImportCSVModal from "@/dialogs/ImportCSVModal";
import ExportPDFModal from "@/dialogs/ExportPDFModal";
import ManagementHeader from "./modules/ManagementHeader";
import ProductFilters from "./modules/ProductFilters";
import ProductTable from "./modules/ProductTable";
import { WifiOff, RefreshCw } from "lucide-react";

const Management = () => {
  const { addNotification } = useNotification();
  const { products, isLoading, isError, archiveProducts } =
    useProducts(addNotification); // <-- Use the new hook

  const [selectedItems, setSelectedItems] = useState([]);
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    view: false,
    import: false,
    export: false,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: "All",
    productType: "All",
  });

  // The rest of your state and functions for filtering, modals, etc. remain here for now.
  // We've only replaced the data fetching and archiving logic.

  const filteredProducts = React.useMemo(() => {
    return (products || []).filter((product) => {
      const statusMatch =
        activeFilters.status === "All" ||
        product.status === activeFilters.status;
      const typeMatch =
        activeFilters.productType === "All" ||
        product.productType === activeFilters.productType;
      return statusMatch && typeMatch;
    });
  }, [products, activeFilters]);

  const { searchTerm, setSearchTerm, searchedProducts } =
    useProductSearch(filteredProducts);
  const {
    paginatedData: paginatedProducts,
    PaginationComponent,
    ItemsPerPageComponent,
    setCurrentPage,
  } = usePagination(searchedProducts);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchTerm, setCurrentPage]);

  const handleArchiveSelected = () => {
    if (selectedItems.length > 0) {
      archiveProducts(selectedItems, {
        onSuccess: () => setSelectedItems([]), // Clear selection on success
      });
    }
  };

  const openModal = (modalName, product = null) => {
    setSelectedProduct(product);
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    setSelectedProduct(null);
  };

  const fetchProducts = () => {
    // This function can be removed or repurposed to invalidate the query if needed
    // For now, React Query handles refetching automatically.
  };

  if (isLoading)
    return <div className="text-center p-8">Loading products...</div>;
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem fetching the data.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries(["products"])}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg"
        >
          <RefreshCw size={16} /> Try Again
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
            onFilterChange={(name, value) =>
              setActiveFilters((prev) => ({ ...prev, [name]: value }))
            }
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
          highlightedRow={null} // Highlighting logic can be revisited
        />
        <PaginationComponent />
      </div>
    </>
  );
};

export default Management;
