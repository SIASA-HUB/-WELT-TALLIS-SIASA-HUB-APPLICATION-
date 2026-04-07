// components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "./AuthService";

const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const location = useLocation();

  if (!AuthService.isAuthenticated()) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
