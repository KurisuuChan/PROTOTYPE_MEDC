// src/pages/NotificationHistory.jsx
import React from "react";
import PropTypes from "prop-types";
import { useNotificationHistory } from "@/hooks/useNotifications.jsx";
import { Link } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { getAccentClass, iconForType } from "@/utils/notifications";

const NotificationItem = ({ item, onMarkAsRead }) => (
  <Link
    to={item.path || "#"}
    onClick={() => onMarkAsRead(item.id)}
    className={`flex items-start gap-4 p-4 transition-colors group ${getAccentClass(
      item.type
    )} ${
      !item.is_read
        ? "bg-blue-50 hover:bg-blue-100"
        : "bg-white hover:bg-gray-50"
    }`}
  >
    <div
      className={`flex-shrink-0 p-3 rounded-full ${
        item.iconBg || "bg-gray-100"
      }`}
    >
      {iconForType(item.type)}
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-gray-900">{item.title}</p>
      <p className="text-sm text-gray-600">{item.description}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(item.created_at).toLocaleString()}
      </p>
    </div>
  </Link>
);

NotificationItem.propTypes = {
  item: PropTypes.object.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
};

const NotificationHistory = () => {
  const { notifications, loading, groupedByDate, markAsRead } =
    useNotificationHistory();

  // --- FIX: Moved rendering logic into a separate function for clarity ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <div className="text-center py-20 text-gray-500">
          <Bell size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">No Notifications Yet</h2>
          <p className="text-md">
            When you get notifications, they'll show up here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {groupedByDate?.map(
          (
            { date, items } // Use optional chaining for safety
          ) => (
            <div
              key={date}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <h3 className="text-sm font-bold text-gray-600 p-4 bg-gray-50 border-b border-gray-200">
                {date}
              </h3>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <Bell size={32} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Notification History
            </h1>
            <p className="text-gray-500 mt-1">
              A complete log of all system and inventory alerts.
            </p>
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default NotificationHistory;
