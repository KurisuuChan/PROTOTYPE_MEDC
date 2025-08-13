import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Lazy-loaded pages for this layout
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Management = lazy(() => import("@/pages/Management"));
const Archived = lazy(() => import("@/pages/Archived"));
const PointOfSales = lazy(() => import("@/pages/PointOfSales"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotificationHistory = lazy(() => import("@/pages/NotificationHistory"));
const Financials = lazy(() => import("@/pages/Financials")); // Corrected import path

const FullLayout = ({ branding, user, handleLogout, onUpdate }) => (
  <div className="flex h-screen bg-gray-200">
    <Sidebar branding={branding} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header handleLogout={handleLogout} user={user} />
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-white to-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/management" element={<Management />} />
          <Route path="/archived" element={<Archived />} />
          <Route
            path="/point-of-sales"
            element={<PointOfSales branding={branding} />}
          />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/notifications" element={<NotificationHistory />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/settings" element={<Settings onUpdate={onUpdate} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  </div>
);

FullLayout.propTypes = {
  branding: PropTypes.object.isRequired,
  user: PropTypes.object,
  handleLogout: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default FullLayout;
