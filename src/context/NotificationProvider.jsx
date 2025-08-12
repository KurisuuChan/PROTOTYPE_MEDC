import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Toast from "@/components/Toast";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [current, setCurrent] = useState(null);

  const addNotification = useCallback(
    (message, type = "success") => {
      const newItem = { message, type, id: Date.now() };
      if (!current) {
        setCurrent(newItem);
      }
    },
    [current]
  );

  const removeNotification = useCallback(() => {
    setCurrent(null);
  }, []);

  const contextValue = useMemo(() => ({ addNotification }), [addNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {current && (
        <Toast
          message={current.message}
          type={current.type}
          onClose={removeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
