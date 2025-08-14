// src/utils/timeFormatters.js

const intervals = [
  { label: "year", seconds: 31536000 },
  { label: "month", seconds: 2592000 },
  { label: "day", seconds: 86400 },
  { label: "hour", seconds: 3600 },
  { label: "minute", seconds: 60 },
  { label: "second", seconds: 1 },
];

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  // If it's more than 7 days ago, return the simple date
  if (seconds > 604800) {
    // 7 days in seconds
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const interval = intervals.find((i) => i.seconds <= seconds);
  if (!interval) {
    return "just now";
  }

  const count = Math.floor(seconds / interval.seconds);
  return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
}
