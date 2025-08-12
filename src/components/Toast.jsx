import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="text-white" size={24} />,
  error: <XCircle className="text-white" size={24} />,
  warning: <AlertTriangle className="text-white" size={24} />,
  info: <Info className="text-white" size={24} />,
};

const bgColors = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

const Toast = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3700);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg shadow-2xl text-white transform transition-all duration-300 ease-in-out ${
        bgColors[type]
      } ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div>{icons[type]}</div>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20">
        <X size={18} />
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
