import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Bell, X, Search, Volume2, VolumeX } from "lucide-react";
import TabButton from "./TabButton";
import { getAccentClass, iconForType } from "@/utils/notifications.jsx";

const notificationItemShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  path: PropTypes.string,
  category: PropTypes.string.isRequired,
  read: PropTypes.bool.isRequired,
  iconBg: PropTypes.string,
  iconType: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  createdAt: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
});

function NotificationItem({ item, onMarkAsRead, onDismiss }) {
  return (
    <Link
      to={item.path || "#"}
      key={item.id}
      onClick={() => onMarkAsRead(item.id)}
      className={`flex items-start gap-3 p-4 transition-colors relative group border-b border-gray-100 ${getAccentClass(
        item.category
      )} ${!item.read ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}`}
    >
      <div className={`flex-shrink-0 p-2 rounded-full ${item.iconBg}`}>
        {iconForType(item.iconType)}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-sm text-gray-900">{item.title}</p>
        <p className="text-sm text-gray-600">{item.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {item.createdAt instanceof Date
            ? item.createdAt.toLocaleString()
            : new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss(item.id);
        }}
        className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </Link>
  );
}

NotificationItem.propTypes = {
  item: notificationItemShape.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

function NotificationGroup({ group, onMarkAsRead, onDismiss }) {
  return (
    <div key={group.date}>
      <div className="sticky top-0 z-[1] bg-white px-4 py-2 text-xs font-semibold text-gray-500">
        {group.date}
      </div>
      {group.items.map((n) => (
        <NotificationItem
          key={n.id}
          item={n}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

NotificationGroup.propTypes = {
  group: PropTypes.shape({
    date: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(notificationItemShape).isRequired,
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const NotificationsDropdown = ({
  isOpen,
  unreadCount,
  notifications,
  loading,
  categories,
  categoryCounts,
  groupedByDate,
  search,
  setSearch,
  mutedCategories,
  toggleMuteCategory,
  onMarkAllAsRead,
  onMarkAsRead,
  onDismiss,
  onMarkCategoryAsRead,
  onClearCategory,
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
    return groupedByDate
      .map(({ date, items }) => ({
        date,
        items:
          activeCategory === "All"
            ? items
            : items.filter((n) => n.category === activeCategory),
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
    <div className="absolute right-0 mt-3 w-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 overflow-hidden">
      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-300"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
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
            onClick={() => onMarkCategoryAsRead(activeCategory)}
          >
            Mark {activeCategory} as read
          </button>
          <span className="text-gray-300">|</span>
          <button
            className="text-red-600 hover:underline"
            onClick={() => onClearCategory(activeCategory)}
          >
            Clear {activeCategory}
          </button>
          {activeCategory !== "All" && (
            <button
              className="ml-auto flex items-center gap-1 text-gray-600 hover:text-gray-800"
              onClick={() => toggleMuteCategory(activeCategory)}
              title={
                mutedCategories.includes(activeCategory) ? "Unmute" : "Mute"
              }
            >
              {mutedCategories.includes(activeCategory) ? (
                <>
                  <VolumeX size={14} /> Unmute {activeCategory}
                </>
              ) : (
                <>
                  <Volume2 size={14} /> Mute {activeCategory}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="max-h-[28rem] overflow-y-auto">{renderContent()}</div>
    </div>
  );
};

NotificationsDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  unreadCount: PropTypes.number.isRequired,
  notifications: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  categories: PropTypes.array.isRequired,
  categoryCounts: PropTypes.object.isRequired,
  groupedByDate: PropTypes.array.isRequired,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  mutedCategories: PropTypes.array.isRequired,
  toggleMuteCategory: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onMarkCategoryAsRead: PropTypes.func.isRequired,
  onClearCategory: PropTypes.func.isRequired,
};

export default NotificationsDropdown;
