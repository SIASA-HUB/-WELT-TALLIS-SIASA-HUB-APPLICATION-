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
const API_BASE_URL = "/api/v1/users";

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

  // Get CSRF token - FIXED endpoint
  const fetchCsrfToken = useCallback(async () => {
    try {
      // First check if user is authenticated
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const response = await api.get("/csrf-token"); // Changed from /auth/csrf-token
      if (response.data.success) {
        setCsrfToken(response.data.csrfToken);
        return response.data.csrfToken;
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  }, []);

  // Get user info from /me endpoint
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/me");
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, []);

  // Check authentication status - FIXED endpoint
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/status"); // Changed from /auth/check
      if (response.data.success && response.data.isAuthenticated) {
        setUser(response.data.user);
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
      const response = await api.post("/login", {
        anonymous_username: username,
        password,
      });

      if (response.data.success) {
        // Store token in localStorage for CSRF requests
        if (response.data.csrfToken) {
          localStorage.setItem("access_token", response.data.csrfToken);
        }

        setUser(response.data.user);
        setIsAuthenticated(true);
        await fetchCsrfToken();
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout function - FIXED endpoint
  const logout = async () => {
    try {
      await api.post("/logout"); // Changed from /auth/logout
      localStorage.removeItem("access_token");
      setUser(null);
      setIsAuthenticated(false);
      setCsrfToken(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Logout failed" };
    }
  };

  // Refresh token - FIXED endpoint
  const refreshToken = async () => {
    try {
      const response = await api.post("/refresh"); // Changed from /auth/refresh
      if (response.data.success) {
        setCsrfToken(response.data.csrfToken);
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
