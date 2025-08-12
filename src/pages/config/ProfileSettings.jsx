// src/pages/config/ProfileSettings.jsx
import React from "react";
import PropTypes from "prop-types";
import { useProfileSettings } from "@/hooks/useProfileSettings";

const ProfileSettings = ({ onUpdate }) => {
  const {
    user,
    loading,
    profileData,
    uploading,
    handleProfileChange,
    handleSaveChanges,
    handlePhotoChange,
  } = useProfileSettings(onUpdate);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Profile Information
      </h2>
      <p className="text-gray-500 mb-8 border-b pb-6">
        Update your personal details here.
      </p>
      <form className="space-y-6" onSubmit={handleSaveChanges}>
        <div className="flex items-center gap-6">
          <img
            src={
              profileData.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`
            }
            alt="Admin"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <label
              htmlFor="photo-upload"
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </label>
            <input
              type="file"
              id="photo-upload"
              name="photo-upload"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploading}
              accept="image/*"
            />
            <p className="mt-2 text-xs text-gray-500">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block">
            <span className="font-medium text-gray-700">Full Name</span>
            <input
              type="text"
              id="full-name"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Role</span>
            <input
              type="text"
              id="role"
              name="role"
              value={profileData.role}
              onChange={handleProfileChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Email Address</span>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Phone Number</span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
        <div className="pt-4 text-right">
          <button
            type="submit"
            className="rounded-lg bg-gray-800 px-6 py-2.5 font-semibold text-white hover:bg-gray-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

ProfileSettings.propTypes = {
  onUpdate: PropTypes.func.isRequired,
};

export default ProfileSettings;
