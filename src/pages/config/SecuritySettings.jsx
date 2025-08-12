import React, { useState } from "react";
import * as api from "@/services/api";

const SecuritySettings = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await api.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Security</h2>
      <p className="text-gray-500 mb-8 border-b pb-6">
        Manage your account security settings.
      </p>
      <form onSubmit={handleUpdatePassword}>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-lg">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="password"
                id="new-password"
                name="new-password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mt-2">{success}</p>
            )}
          </div>

          <div className="pt-4 text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
