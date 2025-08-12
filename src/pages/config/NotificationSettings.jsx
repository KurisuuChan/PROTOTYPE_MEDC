import React, { useEffect, useState } from "react";
import {
  getNotificationSettings,
  setNotificationSettings,
} from "@/utils/notificationStorage";

const NotificationSettings = () => {
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiringSoonDays, setExpiringSoonDays] = useState(30);
  const [enableExpiringSoon, setEnableExpiringSoon] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = getNotificationSettings();
    setLowStockThreshold(savedSettings.lowStockThreshold);
    setExpiringSoonDays(savedSettings.expiringSoonDays);
    setEnableExpiringSoon(savedSettings.enableExpiringSoon);
  }, []);

  const handleSave = () => {
    setNotificationSettings({
      lowStockThreshold: Number(lowStockThreshold) || 0,
      expiringSoonDays: Number(expiringSoonDays) || 0,
      enableExpiringSoon,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    // Inform listeners to re-fetch notification configuration
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h2>
      <p className="text-gray-500 mb-8 border-b pb-6">
        Configure thresholds for inventory alerts and expiry notifications.
      </p>

      <div className="space-y-6 max-w-xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h4 className="font-semibold">Low stock threshold</h4>
            <p className="text-sm text-gray-500">
              Trigger low stock alerts when quantity is equal to or below this
              value.
            </p>
          </div>
          <input
            type="number"
            className="w-28 p-2 border border-gray-300 rounded-lg text-right"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            min={0}
          />
        </div>

        <div className="flex items-center justify-between gap-6">
          <div>
            <h4 className="font-semibold">Enable expiring soon alerts</h4>
            <p className="text-sm text-gray-500">
              Show notifications for medicines that will expire within the
              selected window.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={enableExpiringSoon}
              onChange={(e) => setEnableExpiringSoon(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between gap-6">
          <div>
            <h4 className="font-semibold">Expiring soon window (days)</h4>
            <p className="text-sm text-gray-500">
              Items expiring within this many days will be flagged.
            </p>
          </div>
          <input
            type="number"
            className="w-28 p-2 border border-gray-300 rounded-lg text-right"
            value={expiringSoonDays}
            onChange={(e) => setExpiringSoonDays(e.target.value)}
            min={0}
            disabled={!enableExpiringSoon}
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Save settings
          </button>
          {saved && (
            <span className="ml-3 text-green-600 text-sm">Saved</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
