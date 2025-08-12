import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Management = lazy(() => import("./pages/Management"));
const Archived = lazy(() => import("./pages/Archived"));
const PointOfSales = lazy(() => import("./pages/PointOfSales"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
import * as api from "@/services/api";
import defaultLogo from "@/assets/images/logo-transparent.png";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [branding, setBranding] = useState({
    name: "MedCure",
    url: defaultLogo,
  });

  const fetchSessionAndBranding = async () => {
    try {
      const {
        data: { session },
      } = await api.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);

      const { data: brandingData } = await api.getBranding();
      if (brandingData) {
        setBranding({ name: brandingData.name, url: brandingData.logo_url });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndBranding();

    const { data: authListener } = api.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    fetchSessionAndBranding();
  };

  const handleLogout = async () => {
    await api.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-2xl font-semibold text-gray-600">Loading...</div>
        </div>
      }
    >
      <Routes>
      {isLoggedIn ? (
        <Route
          path="/*"
          element={
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
                    <Route
                      path="/settings"
                      element={<Settings onUpdate={fetchSessionAndBranding} />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      ) : (
        <>
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} branding={branding} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}
      </Routes>
    </Suspense>
  );
}

export default App;
