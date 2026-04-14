// hooks/useAuth.jsx - Fixed for first-time/unauthenticated users

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

// ============================================
// API CONFIGURATION
// ============================================
import api from "../../api/api";
import API from "../../api/config";

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = createContext(null);

// ============================================
// JWT DECODE FUNCTION
// ============================================
const decodeJWT = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const userData = JSON.parse(decoded);

    return userData;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const authCheckDoneRef = useRef(false);

  // Get CSRF token - only if authenticated
  const fetchCsrfToken = useCallback(async () => {
    // Don't fetch CSRF token if not authenticated
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
      const response = await api.get("/users/csrf-token");

      if (response && response.success) {
        setCsrfToken(response.csrfToken);
        return response.csrfToken;
      }
    } catch (error) {
      // Silent fail for CSRF token - not critical
      console.debug("CSRF token fetch skipped:", error?.message);
      return null;
    }
  }, []);

  // Get user info from /me endpoint - FIXED: Only called when token exists
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    // CRITICAL FIX: If no token, don't even try to fetch
    if (!token) {
      return null;
    }

    try {
      const response = await api.get("/users/me");
      if (response && response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return response.data;
      } else {
        // Response but not successful - clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      // Clear invalid token if API returns 401
      if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        setUser(null);
        setIsAuthenticated(false);
      }
      return null;
    }
  }, []);

  // Check authentication status - FIXED for first-time users
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (authCheckDoneRef.current && !isLoading) return;

    setIsLoading(true);

    try {
      // First check if there's a token in localStorage
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");

      if (!token) {
        // No token = definitely not authenticated
        // This is the path for FIRST-TIME USERS
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // Token exists, verify with backend
      try {
        const response = await api.get("/users/status");

        if (response && response.success && response.isAuthenticated) {
          setUser(response.user);
          setIsAuthenticated(true);
          // Only fetch CSRF if authenticated
          await fetchCsrfToken();
        } else {
          // Token invalid or expired
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          localStorage.removeItem("user_data");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (statusError) {
        // API error during status check - assume not authenticated
        console.debug("Status check failed:", statusError?.response?.status);

        // If 401, clear tokens
        if (statusError?.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          localStorage.removeItem("user_data");
        }

        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.debug("Auth check outer error:", error?.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      authCheckDoneRef.current = true;
    }
  }, [fetchCsrfToken, isLoading]);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", {
        identifier: username,
        password,
      });

      if (response && response.success) {
        // Store tokens
        if (response.accessToken) {
          localStorage.setItem("token", response.accessToken);
          localStorage.setItem("access_token", response.accessToken);
        }

        if (response.csrfToken) {
          localStorage.setItem("csrf_token", response.csrfToken);
          setCsrfToken(response.csrfToken);
        }

        const userData = response.user || response.data;
        if (userData) {
          localStorage.setItem("user_data", JSON.stringify(userData));
        }

        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      return { success: false, message: response?.message || "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error?.message || "Login failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post("/users/logout").catch(() => { });
    } catch (_) {
      // Ignore
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("csrf_token");
    localStorage.removeItem("user_data");

    setUser(null);
    setIsAuthenticated(false);
    setCsrfToken(null);

    return { success: true };
  };

  // Refresh token
  const refreshToken = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return { success: false };

    try {
      const response = await api.post("/users/refresh");
      if (response && response.success) {
        if (response.csrfToken) {
          localStorage.setItem("csrf_token", response.csrfToken);
          setCsrfToken(response.csrfToken);
        }
        await checkAuthStatus();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.debug("Token refresh error:", error?.message);
      return { success: false };
    }
  };

  // Get user role with hierarchy
  const getUserRole = () => {
    return user?.role || "user";
  };

  const hasRole = (requiredRole) => {
    const userRole = getUserRole();
    const roleHierarchy = {
      user: 1,
      admin: 2,
      market_admin: 3,
      super_admin: 4,
      ceo: 5,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const isAdmin = () => hasRole("admin");
  const isSuperAdmin = () => hasRole("super_admin");
  const isCEO = () => hasRole("ceo");
  const isMarketAdmin = () => hasRole("market_admin");

  // Initialize auth on mount - only once
  useEffect(() => {
    authCheckDoneRef.current = false;
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    csrfToken,
    login,
    logout,
    refreshToken,
    getUserRole,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isCEO,
    isMarketAdmin,
    checkAuthStatus,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const decodeToken = (token) => decodeJWT(token);

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token");
};

// Get decoded user from token
export const getDecodedUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  return decodeJWT(token);
};

// SYNC check - no API calls, just checks localStorage
export const isLoggedIn = () => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  return !!token;
};


export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "white",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "white",
          textAlign: "center",
        }}
      >
        <div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              background: "#ff3b3b",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const SuperAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="super_admin">{children}</ProtectedRoute>
);

export const CEORoute = ({ children }) => (
  <ProtectedRoute requiredRole="ceo">{children}</ProtectedRoute>
);