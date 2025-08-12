import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import * as api from "@/services/api";
import { useProductSearch } from "@/hooks/useProductSearch";
import { usePagination } from "@/hooks/usePagination.jsx";
import { useNotification } from "@/hooks/useNotification";

import AddProductModal from "@/dialogs/AddProductModal";
import EditProductModal from "@/dialogs/EditProductModal";
import ViewProductModal from "@/dialogs/ViewProductModal";
import ImportCSVModal from "@/dialogs/ImportCSVModal";
import ExportPDFModal from "@/dialogs/ExportPDFModal";

import ManagementHeader from "./modules/ManagementHeader";
import ProductFilters from "./modules/ProductFilters";
import ProductTable, { MobileProductCards } from "./modules/ProductTable";
import { WifiOff, RefreshCw } from "lucide-react";
import { addSystemNotification } from "@/utils/notificationStorage";

const Management = () => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: "All",
    productType: "All",
  });

  const location = useLocation();
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const { addNotification } = useNotification();

  // Normalize status: any item with quantity <= 0 should be treated as Unavailable
  const normalizedProducts = useMemo(() => {
    return (products || []).map((product) => {
      const quantity = product?.quantity ?? 0;
      if (quantity <= 0 && product.status !== "Archived") {
        return { ...product, status: "Unavailable" };
      }
      return product;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((product) => {
      const statusMatch =
        activeFilters.status === "All" ||
        product.status === activeFilters.status;
      const typeMatch =
        activeFilters.productType === "All" ||
        product.productType === activeFilters.productType;
      return statusMatch && typeMatch;
    });
  }, [normalizedProducts, activeFilters]);

  const { searchTerm, setSearchTerm, searchedProducts } =
    useProductSearch(filteredProducts);

  const {
    paginatedData: paginatedProducts,
    PaginationComponent,
    ItemsPerPageComponent,
    setCurrentPage,
    itemsPerPage,
  } = usePagination(searchedProducts);

  // Effect 1: Catches the highlight request from the URL and resets filters.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");
    if (highlightId) {
      setActiveFilters({ status: "All", productType: "All" });
      setSearchTerm("");
      setPendingHighlight(parseInt(highlightId, 10));
    }
  }, [location, setSearchTerm]);

  // Effect 2: Executes the highlight once the product list is confirmed to be up-to-date.
  useEffect(() => {
    if (pendingHighlight && searchedProducts.length > 0) {
      const productIndex = searchedProducts.findIndex(
        (p) => p.id === pendingHighlight
      );

      if (productIndex !== -1) {
        const pageNumber = Math.ceil((productIndex + 1) / itemsPerPage);
        setCurrentPage(pageNumber);
        setHighlightedRow(pendingHighlight);

        const timer = setTimeout(() => {
          setHighlightedRow(null);
        }, 3000);

        setPendingHighlight(null);
        return () => clearTimeout(timer);
      }
    }
  }, [pendingHighlight, searchedProducts, itemsPerPage, setCurrentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await api.getProducts();
    if (error) {
      console.error("Error fetching products:", error);
      setError(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleArchiveSelected = async () => {
    if (selectedItems.length === 0) return;
    const { error } = await api.archiveProducts(selectedItems);

    if (error) {
      console.error("Error archiving products:", error);
      addNotification(`Error: ${error.message}`, "error");
    } else {
      addNotification(
        `${selectedItems.length} product(s) successfully archived.`,
        "success"
      );
      addSystemNotification({
        id: `archive-${Date.now()}`,
        iconType: "archive",
        iconBg: "bg-purple-100",
        title: "Products Archived",
        category: "System",
        description: `${selectedItems.length} product(s) were archived.`,
        createdAt: new Date().toISOString(),
        path: "/archived",
      });
      fetchProducts();
      setSelectedItems([]);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setActiveFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={fetchProducts}
      />
      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchProducts}
      />
      <ExportPDFModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allProducts={normalizedProducts}
      />
      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            product={selectedProduct}
            onProductUpdated={fetchProducts}
          />
          <ViewProductModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            product={selectedProduct}
          />
        </>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg font-sans">
        <ManagementHeader
          selectedItemsCount={selectedItems.length}
          onAddProduct={() => setIsAddModalOpen(true)}
          onArchiveSelected={handleArchiveSelected}
          onImport={() => setIsImportModalOpen(true)}
          onExport={() => setIsExportModalOpen(true)}
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
        {/* Desktop/tablet */}
        <ProductTable
          products={paginatedProducts}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchedProducts={searchedProducts}
          onViewProduct={handleViewProduct}
          onEditProduct={handleEditProduct}
          highlightedRow={highlightedRow}
        />
        {/* Mobile cards */}
        <div className="mt-4">
          <MobileProductCards
            products={paginatedProducts}
            selectedItems={selectedItems}
            handleSelectItem={(id) =>
              setSelectedItems((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            onViewProduct={handleViewProduct}
            onEditProduct={handleEditProduct}
          />
        </div>
        <PaginationComponent />
      </div>
    </>
  );
};

export default Management;
