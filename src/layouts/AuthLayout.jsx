import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import LoginPage from "../pages/auth/LoginPage";

const AuthLayout = ({ onLogin, branding }) => (
  <Routes>
    <Route
      path="/login"
      element={<LoginPage onLogin={onLogin} branding={branding} />}
    />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

AuthLayout.propTypes = {
  onLogin: PropTypes.func.isRequired,
  branding: PropTypes.object.isRequired,
};

export default AuthLayout;
