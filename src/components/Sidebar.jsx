import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Contact,
  ChevronsLeft,
  Menu,
  Pill,
  Archive,
} from "lucide-react";
import Logo from "./Logo.jsx";
import PropTypes from "prop-types";

const Sidebar = ({ branding }) => {
  const [expanded, setExpanded] = useState(() => {
    const savedState = localStorage.getItem("sidebar-expanded");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
  }, [expanded]);

  return (
    <aside
      className={`h-full bg-white border-r border-gray-200 text-gray-800 transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between h-[69px] px-4">
        {expanded && <Logo branding={branding} />}
        <button
          onClick={() => setExpanded((curr) => !curr)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {expanded ? <ChevronsLeft /> : <Menu />}
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.name} className="relative group">
              <Link
                to={item.path}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  className={`flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110 ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out font-medium ${
                    expanded ? "w-36 ml-3" : "w-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>

              {!expanded && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 rounded-md px-2 py-1 ml-4 bg-blue-100 text-blue-800 text-sm invisible opacity-0 -translate-x-3 transition-all duration-300 ease-in-out group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
  { name: "Management", icon: <Pill size={20} />, path: "/management" },
  {
    name: "Point Of Sales",
    icon: <ShoppingCart size={20} />,
    path: "/point-of-sales",
  },
  { name: "Contacts", icon: <Contact size={20} />, path: "/contacts" },
  { name: "Archived", icon: <Archive size={20} />, path: "/archived" },
  { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
];

Sidebar.propTypes = {
  branding: PropTypes.object,
};

export default Sidebar;
