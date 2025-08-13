import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
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

export function NotificationItem({ item, onMarkAsRead, onDismiss }) {
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

export function NotificationGroup({ group, onMarkAsRead, onDismiss }) {
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
