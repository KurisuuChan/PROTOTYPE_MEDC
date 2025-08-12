import React from "react";
import { AlertTriangle, Archive, Bell, PackageX, RotateCcw, Tag, Trash2, UploadCloud } from "lucide-react";

export const getAccentClass = (category) => {
  switch (category) {
    case "Low Stock":
      return "border-l-4 border-yellow-400";
    case "No Stock":
      return "border-l-4 border-red-500";
    case "Expired":
      return "border-l-4 border-red-500";
    case "Expiring Soon":
      return "border-l-4 border-orange-400";
    case "System":
      return "border-l-4 border-gray-300";
    default:
      return "border-l-4 border-blue-400";
  }
};

export const iconForType = (iconType) => {
  switch (iconType) {
    case "upload":
      return <UploadCloud className="text-green-500" />;
    case "archive":
      return <Archive className="text-purple-500" />;
    case "unarchive":
      return <RotateCcw className="text-green-600" />;
    case "delete":
      return <Trash2 className="text-red-500" />;
    case "price":
      return <Tag className="text-blue-600" />;
    case "lowStock":
      return <AlertTriangle className="text-yellow-500" />;
    case "noStock":
      return <PackageX className="text-red-500" />;
    case "expired":
      return <AlertTriangle className="text-red-500" />;
    case "expiringSoon":
      return <AlertTriangle className="text-orange-500" />;
    default:
      return <Bell className="text-gray-500" />;
  }
};


