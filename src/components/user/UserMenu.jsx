import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, LogOut, User } from "lucide-react";

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = user?.user_metadata?.full_name || "Administrator";
  const displayEmail = user?.email || "medcure.ph";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={ref}>
      <button className="flex items-center space-x-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
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
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg py-2 z-30 border border-gray-100">
          <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

UserMenu.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default UserMenu;


