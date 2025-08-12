// src/hooks/useBrandingSettings.jsx
import { useState, useEffect } from "react";
import * as api from "@/services/api";

export const useBrandingSettings = (onUpdate) => {
  const [brandingData, setBrandingData] = useState({
    logoName: "",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      const { data, error } = await api.getBranding();

      if (data) {
        setBrandingData({
          logoName: data.name,
          logoUrl: data.logo_url,
        });
      } else {
        console.error("Error fetching branding:", error);
      }
      setLoading(false);
    };
    fetchBranding();
  }, []);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileName = `public/${Date.now()}`;
    const { error: uploadError } = await api.uploadFile(
      "logos",
      fileName,
      file
    );

    if (uploadError) {
      alert("Error uploading logo: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = api.getPublicUrl("logos", fileName);

    setBrandingData((prev) => ({ ...prev, logoUrl: data.publicUrl }));
    setUploading(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const { error } = await api.updateBranding({
      name: brandingData.logoName,
      logo_url: brandingData.logoUrl,
    });

    if (error) {
      alert("Error updating branding: " + error.message);
    } else {
      alert("Branding updated successfully!");
      onUpdate();
    }
  };

  const setLogoName = (name) => {
    setBrandingData((prev) => ({ ...prev, logoName: name }));
  };

  return {
    brandingData,
    loading,
    uploading,
    handleLogoUpload,
    handleSaveChanges,
    setLogoName,
  };
};
