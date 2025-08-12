// src/pages/auth/LoginPage.jsx
import React from "react";
import PropTypes from "prop-types";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";

const LoginPage = ({ onLogin, branding }) => {
  const { credentials, error, loading, handleChange, handleLogin } =
    useLogin(onLogin);

  return (
    <div className="flex items-center justify-center h-screen bg-blue-100 font-sans">
      <div className="w-full max-w-lg p-12 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center">
          <img src={branding.url} alt="MedCure Logo" className="h-20 w-20" />
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-light text-gray-800">Welcome Back</h2>
          <p className="mt-2 text-lg text-gray-500">
            Please enter your email and password to log in.
          </p>
        </div>

        <form className="w-4/5 mx-auto space-y-8" onSubmit={handleLogin}>
          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-400 p-4"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
                </div>
                <div>
                  <p className="font-bold">Login Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="relative">
            <label
              htmlFor="email-address"
              className="absolute left-4 -top-2 bg-white px-1 text-sm text-gray-600"
            >
              Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 text-lg text-gray-800 bg-white border border-gray-400 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              value={credentials.email}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="absolute left-4 -top-2 bg-white px-1 text-sm text-gray-600"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 text-lg text-gray-800 bg-white border border-gray-400 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset- focus:ring-indigo-00 disabled:bg-indigo-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  branding: PropTypes.shape({
    url: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default LoginPage;
