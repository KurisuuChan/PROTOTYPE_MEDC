// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, Bell, User, ChevronDown, LogOut } from "lucide-react";
import { useNotificationHistory } from "@/hooks/useNotifications.jsx";
import NotificationsDropdown from "./notifications/NotificationsDropdown";

const Header = ({ handleLogout, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationsRef = useRef(null);
  const dropdownRef = useRef(null);

  // The hook now returns everything we need
  const notificationProps = useNotificationHistory();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.user_metadata?.full_name || "Administrator";
  const displayEmail = user?.email || "medcure.ph";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-20 flex items-center h-[69px] bg-white border-b border-gray-200">
      <div className="flex items-center justify-between w-full px-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="header-search"
            className="w-full py-2.5 pl-12 pr-4 text-gray-800 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
            placeholder="Search for anything..."
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 text-gray-500 hover:text-blue-600 relative rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notificationProps.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold border-2 border-white">
                  {notificationProps.unreadCount > 99
                    ? "99+"
                    : notificationProps.unreadCount}
                </span>
              )}
            </button>
            <NotificationsDropdown
              isOpen={notificationsOpen}
              {...notificationProps} // Pass all props from the hook
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="text-sm hidden md:block">
                <div className="font-semibold text-gray-800">{displayName}</div>
                <div className="text-xs text-gray-500">{displayEmail}</div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg py-2 z-30 border border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  handleLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default Header;
