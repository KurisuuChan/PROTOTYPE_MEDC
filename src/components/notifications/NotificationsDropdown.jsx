// src/components/notifications/NotificationsDropdown.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react"; // Removed unused 'Search' import
import TabButton from "./TabButton";
import { NotificationGroup } from "./NotificationItem.jsx";

const NotificationsDropdown = ({
  isOpen,
  notifications,
  loading,
  categories,
  categoryCounts,
  groupedByDate,
  onMarkAsRead,
  onDismiss,
  markAllAsRead,
}) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? notifications
        : notifications.filter((n) => n.category === activeCategory),
    [activeCategory, notifications]
  );

  const filteredGroups = useMemo(() => {
    if (!groupedByDate) return [];

    return groupedByDate
      .map(({ date, items }) => ({
        date,
        items:
          activeCategory === "All"
            ? items
            : items.filter((n) => n.type === activeCategory),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedByDate, activeCategory]);

  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Bell size={32} className="mx-auto mb-2" />
          <p>No new notifications</p>
        </div>
      );
    }
    return (
      <div className="divide-y divide-gray-100">
        {filteredGroups.map((g) => (
          <NotificationGroup
            key={g.date}
            group={g}
            onMarkAsRead={onMarkAsRead}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-full max-w-md sm:w-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 flex flex-col">
      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
      </div>
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-[45px] z-10">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <TabButton
              key={cat}
              category={cat}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              count={categoryCounts[cat] || 0}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => markAllAsRead()}
          >
            Mark All as Read
          </button>
        </div>
      </div>
      <div className="max-h-[28rem] overflow-y-auto">{renderContent()}</div>
      <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
        <Link
          to="/notifications"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
};

NotificationsDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  notifications: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  categories: PropTypes.array.isRequired,
  categoryCounts: PropTypes.object.isRequired,
  groupedByDate: PropTypes.array.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  markAllAsRead: PropTypes.func.isRequired,
};

export default NotificationsDropdown;
