// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/services/api";
import defaultLogo from "@/assets/images/logo-transparent.png";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [branding, setBranding] = useState({
    name: "MedCure",
    url: defaultLogo,
  });
  const navigate = useNavigate();

  const fetchSessionAndBranding = useCallback(async () => {
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
      // If there's an error, ensure the user is logged out
      await api.signOut();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login");
    } finally {
      setAuthLoading(false);
    }
  }, [navigate]);

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
  }, [fetchSessionAndBranding]);

  const handleLogout = async () => {
    await api.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };

  return {
    isLoggedIn,
    user,
    authLoading,
    branding,
    handleLogout,
    fetchSessionAndBranding, // Expose this to be called on login
  };
};
