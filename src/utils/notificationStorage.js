// src/utils/notificationStorage.js

// Centralized helpers for notification-related localStorage state
const STORAGE_KEYS = {
  readTimestamps: "readNotificationTimestamps", // Replaces readIds
  dismissedIds: "dismissedNotificationIds",
  lowStockTimestamps: "lowStockTimestamps",
  settings: "notificationSettings",
  systemNotifications: "systemNotifications",
};

export const getStoredJson = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return null;
  }
};

export const setStoredJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- MODIFIED SECTION ---
// We now store a timestamp for each read notification.
export const getReadTimestamps = () =>
  getStoredJson(STORAGE_KEYS.readTimestamps) || {};

export const updateReadTimestamp = (notificationId) => {
  const timestamps = getReadTimestamps();
  timestamps[notificationId] = new Date().toISOString();
  setStoredJson(STORAGE_KEYS.readTimestamps, timestamps);
};
// --- END MODIFIED SECTION ---

export const getDismissedNotificationIds = () =>
  getStoredJson(STORAGE_KEYS.dismissedIds) || [];
export const setDismissedNotificationIds = (ids) =>
  setStoredJson(STORAGE_KEYS.dismissedIds, ids);

// Low stock timestamps
export const getLowStockTimestamps = () =>
  getStoredJson(STORAGE_KEYS.lowStockTimestamps) || {};
export const setLowStockTimestamps = (timestamps) =>
  setStoredJson(STORAGE_KEYS.lowStockTimestamps, timestamps);

// ... (rest of the file remains the same)
const DEFAULT_SETTINGS = {
  lowStockThreshold: 10,
  expiringSoonDays: 30,
  enableExpiringSoon: true,
};

export const getNotificationSettings = () => {
  const stored = getStoredJson(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...(stored || {}) };
};

export const setNotificationSettings = (settings) => {
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  setStoredJson(STORAGE_KEYS.settings, merged);
};

// System notifications storage
export const getSystemNotifications = () =>
  getStoredJson(STORAGE_KEYS.systemNotifications) || [];
export const setSystemNotifications = (items) =>
  setStoredJson(STORAGE_KEYS.systemNotifications, items);

export const addSystemNotification = (item) => {
  const current = getSystemNotifications();
  const exists = current.some((n) => n.id === item.id);
  const next = exists ? current : [item, ...current];
  setSystemNotifications(next);
  // Let listeners know to re-fetch
  window.dispatchEvent(new Event("storage"));
};

export const removeSystemNotification = (id) => {
  const current = getSystemNotifications();
  const next = current.filter((n) => n.id !== id);
  setSystemNotifications(next);
};
