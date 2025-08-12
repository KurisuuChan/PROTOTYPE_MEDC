import React, { useState } from "react";
import PropTypes from "prop-types";
import { Search, Filter, X } from "lucide-react";

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  onFilterChange,
  activeFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleStatusChange = (e) => {
    onFilterChange("status", e.target.value);
  };

  const handleTypeChange = (e) => {
    onFilterChange("productType", e.target.value);
  };

  const resetFilters = () => {
    onFilterChange("status", "All");
    onFilterChange("productType", "All");
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
      {/* Search Input */}
      <div className="relative w-full sm:w-auto">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="relative w-full sm:w-auto">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <Filter size={16} />
          <span>Filters</span>
        </button>

        {isFilterOpen && (
          <div className="absolute left-0 sm:left-auto top-full mt-2 w-full sm:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800">Filter By</h4>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
                <select
                  value={activeFilters.status}
                  onChange={handleStatusChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Product Type
                </span>
                <select
                  value={activeFilters.productType}
                  onChange={handleTypeChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProductFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  activeFilters: PropTypes.object.isRequired,
};

export default ProductFilters;
