import React from "react";
import PropTypes from "prop-types";
import { Plus, Upload, Archive, Download } from "lucide-react";

const ManagementHeader = ({
  selectedItemsCount,
  onAddProduct,
  onArchiveSelected,
  onImport,
  onExport,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div className="text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Product Management
      </h1>
      <p className="text-gray-500 mt-1">
        Manage your pharmacy's inventory here.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2 sm:gap-3 justify-center sm:justify-end w-full sm:w-auto">
      {selectedItemsCount > 0 && (
        <button
          onClick={onArchiveSelected}
          className="flex items-center justify-center gap-2 border border-red-300 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Archive size={16} />
          Archive Selected ({selectedItemsCount})
        </button>
      )}
      <button
        onClick={onImport}
        className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        <Download size={16} />
        Import
      </button>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        <Upload size={16} />
        Export
      </button>
      <button
        onClick={onAddProduct}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
      >
        <Plus size={18} />
        Add Product
      </button>
    </div>
  </div>
);

ManagementHeader.propTypes = {
  selectedItemsCount: PropTypes.number.isRequired,
  onAddProduct: PropTypes.func.isRequired,
  onArchiveSelected: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

export default ManagementHeader;
