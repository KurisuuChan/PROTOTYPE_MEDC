// src/hooks/useManagement.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as api from "@/services/api";
import { addSystemNotification } from "@/utils/notificationStorage";

export const useManagement = (addNotification) => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [highlightedRow, setHighlightedRow] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await api.getProducts();
    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      setError(fetchError);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");
    if (highlightId) {
      const numericId = parseInt(highlightId, 10);
      setHighlightedRow(numericId);

      // We need to remove the highlight from the URL to avoid a refresh loop
      params.delete("highlight");
      navigate({ search: params.toString() }, { replace: true });

      const timer = setTimeout(() => setHighlightedRow(null), 3000); // Highlight for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [location.search, navigate]);

  const filteredProducts = useMemo(() => {
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

  const handleArchiveSelected = async () => {
    if (selectedItems.length === 0) return;
    const { error: archiveError } = await api.archiveProducts(selectedItems);

    if (archiveError) {
      addNotification(`Error: ${archiveError.message}`, "error");
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
  };

  const openModal = (modalName, product = null) => {
    setSelectedProduct(product);
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    setSelectedProduct(null);
  };

  return {
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
  };
};
