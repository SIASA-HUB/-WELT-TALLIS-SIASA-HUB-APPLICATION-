// hooks/useAuth.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

  // Get CSRF token - FIXED endpoint with caching
  const fetchCsrfToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const response = await api.getWithCache("/users/csrf-token", (data) => {
        if (data && data.success) {
          setCsrfToken(data.csrfToken);
        }
      });
      
      if (response && response.success) {
        setCsrfToken(response.csrfToken);
        return response.csrfToken;
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  }, []);

  // Get user info from /me endpoint with SWR
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.getWithCache("/users/me", (data) => {
        if (data && data.success) {
          setUser(data.data);
          setIsAuthenticated(true);
        }
      });
      if (response && response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, []);

  // Check authentication status - FIXED endpoint with SWR
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getWithCache("/users/status", (data) => {
        if (data && data.success && data.isAuthenticated) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      });

      if (response && response.success && response.isAuthenticated) {
        setUser(response.user);
        setIsAuthenticated(true);
        await fetchCsrfToken();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCsrfToken]);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", {
        identifier: username, // backend accepts email OR username
        password,
      });

      if (response && response.success) {
        // Store the REAL JWT access token — used by axios Bearer interceptor
        if (response.accessToken) {
          localStorage.setItem("token", response.accessToken);
          localStorage.setItem("access_token", response.accessToken); // keep both for compatibility
        }

        // Store CSRF token separately — do NOT mix with JWT
        if (response.csrfToken) {
          localStorage.setItem("csrf_token", response.csrfToken);
          setCsrfToken(response.csrfToken);
        }

        // Store full user object for components that need it (e.g. MyOrders)
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
      await api.post("/users/logout");
    } catch (_) { /* ignore logout API errors */ }
    // Always clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("csrf_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setIsAuthenticated(false);
    setCsrfToken(null);
    return { success: true };
  };


  // Refresh token — axios interceptor already unwraps .data, so use response directly
  const refreshToken = async () => {
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
      console.error("Token refresh error:", error);
      return { success: false };
    }
  };

  // Get user role with hierarchy
  const getUserRole = () => {
    return user?.role || "user";
  };

  // Check if user has specific role
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

  // Check if user can access admin panel
  const isAdmin = () => {
    return hasRole("admin");
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return hasRole("super_admin");
  };

  // Check if user is CEO
  const isCEO = () => {
    return hasRole("ceo");
  };

  // Check if user is market admin
  const isMarketAdmin = () => {
    return hasRole("market_admin");
  };

  // Initialize auth on mount
  useEffect(() => {
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

// ============================================
// CUSTOM HOOK TO USE AUTH ANYWHERE
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ============================================
// DECODE TOKEN UTILITY
// ============================================
export const decodeToken = (token) => {
  return decodeJWT(token);
};

// Get token from cookie
export const getTokenFromCookie = () => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "access_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Get decoded user from token
export const getDecodedUserFromToken = () => {
  const token = getTokenFromCookie();
  if (!token) return null;
  return decodeJWT(token);
};

// ============================================
// PROTECTED ROUTE COMPONENTS
// ============================================
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
          <button onClick={() => (window.location.href = "/")}>Go Home</button>
        </div>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};

export const SuperAdminRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="super_admin">{children}</ProtectedRoute>;
};

export const CEORoute = ({ children }) => {
  return <ProtectedRoute requiredRole="ceo">{children}</ProtectedRoute>;
};
