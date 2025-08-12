// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Management = lazy(() => import("./pages/Management"));
const Archived = lazy(() => import("./pages/Archived"));
const PointOfSales = lazy(() => import("./pages/PointOfSales"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationHistory = lazy(() => import("./pages/NotificationHistory"));

const App = () => {
  const {
    isLoggedIn,
    user,
    authLoading,
    branding,
    handleLogout,
    fetchSessionAndBranding,
  } = useAuth();

  const handleLogin = () => {
    fetchSessionAndBranding();
  };

  const FullLayout = () => (
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
            <Route
              path="/settings"
              element={<Settings onUpdate={fetchSessionAndBranding} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );

  const AuthLayout = () => (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} branding={branding} />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );

  const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-2xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isLoggedIn ? <FullLayout /> : <AuthLayout />}
    </Suspense>
  );
};

export default App;
