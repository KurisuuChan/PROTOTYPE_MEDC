import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import * as api from "@/services/api";

const ProfileSettings = ({ onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await api.getUser();
      const user = data?.user;
      if (user) {
        setUser(user);
        setFullName(user.user_metadata.full_name || "");
        setRole(user.user_metadata.role || "");
        setEmail(user.email);
        setPhone(user.user_metadata.phone || "");
        setAvatarUrl(user.user_metadata.avatar_url);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const { error } = await api.updateUser({
      email: email,
      data: {
        full_name: fullName,
        role: role,
        phone: phone,
        avatar_url: avatarUrl,
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
    const { error: uploadError } = await api.uploadFile("avatars", fileName, file);

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = api.getPublicUrl("avatars", fileName);

    const publicUrl = data.publicUrl;
    setAvatarUrl(publicUrl);

    const { error: updateUserError } = await api.updateUser({ data: { avatar_url: publicUrl } });

    if (updateUserError) {
      alert("Error updating user photo: " + updateUserError.message);
    } else {
      onUpdate();
    }

    setUploading(false);
  };

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
            src={avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`}
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
              name="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Role</span>
            <input
              type="text"
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Email Address</span>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="font-medium text-gray-700">Phone Number</span>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
