import React, { useState } from "react";
import PropTypes from "prop-types";
import { User, Shield, Bell, Image as ImageIcon } from "lucide-react";

// Import the settings components from the new 'config' folder
import ProfileSettings from "./config/ProfileSettings";
import BrandingSettings from "./config/BrandingSettings";
import SecuritySettings from "./config/SecuritySettings";
import NotificationSettings from "./config/NotificationSettings";

const Settings = ({ onUpdate }) => {
  const [activeTab, setActiveTab] = useState("Profile");

  const settingsTabs = [
    { name: "Profile", icon: <User size={20} /> },
    { name: "Branding", icon: <ImageIcon size={20} /> },
    { name: "Security", icon: <Shield size={20} /> },
    { name: "Notifications", icon: <Bell size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <ProfileSettings onUpdate={onUpdate} />;
      case "Branding":
        return <BrandingSettings onUpdate={onUpdate} />;
      case "Security":
        return <SecuritySettings />;
      case "Notifications":
        return <NotificationSettings />;
      default:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800">{activeTab}</h2>
            <p className="mt-2 text-gray-600">Content not found.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-140px)]">
      {/* Sidebar Navigation */}
      <aside className="lg:w-1/4 bg-white p-4 rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold text-gray-800 p-4">Settings</h1>
        <nav className="space-y-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.name
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-6 rounded-2xl shadow-lg">
        {renderContent()}
      </main>
    </div>
  );
};

Settings.propTypes = {
  onUpdate: PropTypes.func.isRequired,
};

export default Settings;
