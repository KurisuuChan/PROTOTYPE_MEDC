import React from "react";
import PropTypes from "prop-types";

const TabButton = ({ category, activeCategory, setActiveCategory, count = 0 }) => (
  <button
    onClick={() => setActiveCategory(category)}
    className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-2 ${
      activeCategory === category
        ? "bg-blue-600 text-white shadow"
        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
    }`}
  >
    <span>{category}</span>
    {count > 0 && (
      <span
        className={`text-[10px] rounded-full px-1.5 py-0.5 ${
          activeCategory === category ? "bg-white/20" : "bg-gray-200 text-gray-700"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

TabButton.propTypes = {
  category: PropTypes.string.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  count: PropTypes.number,
};

export default TabButton;


