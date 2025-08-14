import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const usePagination = (data) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // --- BUG FIX ---
  // Add this useEffect to reset the page if it becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages, currentPage]);
  // --- END BUG FIX ---

  const PaginationComponent = () => (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-2">
        <button
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight size={20} />
        </button>
      </nav>
    </div>
  );

  const ItemsPerPageComponent = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>Show:</span>
      <select
        className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );

  return {
    paginatedData,
    PaginationComponent,
    ItemsPerPageComponent,
    setCurrentPage,
    itemsPerPage,
  };
};
