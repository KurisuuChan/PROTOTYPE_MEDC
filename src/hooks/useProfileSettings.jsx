// src/hooks/useProfileSettings.jsx
import { useState, useEffect } from "react";
import * as api from "@/services/api";

export const useProfileSettings = (onUpdate) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    avatarUrl: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await api.getUser();
      const user = data?.user;
      if (user) {
        setUser(user);
        setProfileData({
          fullName: user.user_metadata.full_name || "",
          role: user.user_metadata.role || "",
          email: user.email,
          phone: user.user_metadata.phone || "",
          avatarUrl: user.user_metadata.avatar_url,
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const { error } = await api.updateUser({
      email: profileData.email,
      data: {
        full_name: profileData.fullName,
        role: profileData.role,
        phone: profileData.phone,
        avatar_url: profileData.avatarUrl,
      },
    });

    if (error) {
      alert("Error updating the user: " + error.message);
    } else {
      alert("Profile updated successfully!");
      onUpdate();
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    setUploading(true);

    const fileName = `${user.id}/${Date.now()}`;
    const { error: uploadError } = await api.uploadFile(
      "avatars",
      fileName,
      file
    );

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = api.getPublicUrl("avatars", fileName);

    const publicUrl = data.publicUrl;
    setProfileData((prev) => ({ ...prev, avatarUrl: publicUrl }));

    const { error: updateUserError } = await api.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateUserError) {
      alert("Error updating user photo: " + updateUserError.message);
    } else {
      onUpdate();
    }

    setUploading(false);
  };

  return {
    user,
    loading,
    profileData,
    uploading,
    handleProfileChange,
    handleSaveChanges,
    handlePhotoChange,
  };
};
