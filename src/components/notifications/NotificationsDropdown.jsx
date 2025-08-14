// src/components/notifications/NotificationsDropdown.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Bell, Settings, ArrowRight } from "lucide-react";
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

  const filteredGroups = useMemo(() => {
    if (activeCategory === "All") {
      return groupedByDate;
    }
    return groupedByDate
      .map(({ date, items }) => ({
        date,
        items: items.filter((n) => n.category === activeCategory),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeCategory, groupedByDate]);

  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-center text-gray-500">Loading...</div>;
    }
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
          <Bell size={40} className="mb-3 text-gray-400" />
          <h4 className="font-semibold text-gray-700">All caught up!</h4>
          <p className="text-sm">You have no new notifications.</p>
        </div>
      );
    }
    if (filteredGroups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
          <Bell size={40} className="mb-3 text-gray-400" />
          <h4 className="font-semibold text-gray-700">No Notifications</h4>
          <p className="text-sm">
            There are no notifications in this category.
          </p>
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
    <div className="absolute right-0 mt-3 w-full max-w-md sm:w-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-200 z-30 flex flex-col">
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-20">
        <h3 className="font-semibold text-lg text-gray-800">Notifications</h3>
        <div className="flex items-center gap-3">
          <button
            className="text-xs text-blue-600 hover:underline font-medium"
            onClick={() => markAllAsRead()}
          >
            Mark All as Read
          </button>
          <Link
            to="/settings"
            state={{ defaultTab: "Notifications" }}
            title="Notification Settings"
          >
            <Settings
              size={18}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            />
          </Link>
        </div>
      </div>
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-[69px] z-20">
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
      </div>
      <div className="max-h-[28rem] overflow-y-auto">{renderContent()}</div>
      <div className="p-3 text-center border-t border-gray-100 bg-white sticky bottom-0">
        <Link
          to="/notifications"
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
        >
          View All Notifications <ArrowRight size={14} />
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
