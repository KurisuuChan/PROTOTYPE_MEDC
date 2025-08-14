import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { iconForType } from "@/utils/notifications.jsx";
import { formatRelativeTime } from "@/utils/timeFormatters.js"; // Import the new formatter

const notificationItemShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  path: PropTypes.string,
  type: PropTypes.string.isRequired, // We will use `type` for the icon
  is_read: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  created_at: PropTypes.string.isRequired,
});

export function NotificationItem({ item, onMarkAsRead, onDismiss }) {
  const accentColors = {
    "Low Stock": "bg-yellow-100",
    "No Stock": "bg-red-100",
    System: "bg-blue-100",
    Default: "bg-gray-100",
  };

  const iconBgClass = accentColors[item.category] || accentColors.Default;

  return (
    <div className="relative flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 group">
      {!item.is_read && (
        <span
          className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"
          title="Unread"
        ></span>
      )}
      <div className={`flex-shrink-0 p-2 rounded-full ${iconBgClass}`}>
        {iconForType(item.type)}
      </div>
      <div className="flex-grow">
        <Link
          to={item.path || "#"}
          onClick={() => onMarkAsRead(item.id)}
          className="focus:outline-none"
        >
          <p className="font-semibold text-sm text-gray-800 hover:text-blue-600 transition-colors">
            {item.title}
          </p>
        </Link>
        <p className="text-sm text-gray-600">{item.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatRelativeTime(item.created_at)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss(item.id);
        }}
        title="Dismiss notification"
        className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

NotificationItem.propTypes = {
  item: notificationItemShape.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export function NotificationGroup({ group, onMarkAsRead, onDismiss }) {
  return (
    <div key={group.date}>
      <div className="sticky top-0 z-[1] bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 border-y border-gray-200">
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
