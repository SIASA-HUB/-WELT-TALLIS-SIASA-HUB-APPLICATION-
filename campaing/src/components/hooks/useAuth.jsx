// hooks/useAuth.jsx - Fixed: Token expiry handling
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../../api/api";

const AuthContext = createContext(null);

// ========== ADDED: Helper functions for token expiry ==========
const getStoredToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token");
};

const isTokenExpired = () => {
  const expiry = localStorage.getItem("token_expiry");
  if (!expiry) return false;
  const parsedExpiry = parseInt(expiry);
  if (isNaN(parsedExpiry)) return false;
  
  // Safety: If expiry is suspiciously small (e.g. before year 2024), it's likely invalid.
  // We assume it's NOT expired and let the backend decide via 401.
  if (parsedExpiry < 1704067200000) return false; 
  
  return Date.now() > parsedExpiry;
};

const clearAuthData = () => {
  console.log('[AUTH] Clearing all local authentication data');
  const keys = [
    "access_token", "token", "csrf_token", "user_data", "token_expiry",
    "leaderToken", "aspirant_token", "admin_token"
  ];
  keys.forEach(k => localStorage.removeItem(k));
};
// ==============================================================

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const authCheckDoneRef = useRef(false);

  const fetchCsrfToken = useCallback(async () => {
    const token = getStoredToken();
    if (!token || isTokenExpired()) return null; // <-- ADDED expiry check
    try {
      const response = await api.get("/users/csrf-token");
      if (response?.success) {
        setCsrfToken(response.csrfToken);
        return response.csrfToken;
      }
    } catch (error) {
      console.debug("CSRF token fetch skipped:", error?.message);
    }
    return null;
  }, []);

  const fetchUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token || isTokenExpired()) return null; // <-- ADDED expiry check
    try {
      const response = await api.get("/users/me");
      if (response?.success && response?.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        return response.data;
      } else {
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      if (error?.response?.status === 401) clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckDoneRef.current && !isLoading) return;
    setIsLoading(true);

    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // <-- ADDED: If token expired, clear and treat as not authenticated
      if (isTokenExpired()) {
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // Token exists and not expired – verify with backend
      try {
        const response = await api.get("/users/status");
        if (response?.success && response?.isAuthenticated) {
          setUser(response.user);
          setIsAuthenticated(true);
          await fetchCsrfToken();
        } else {
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (statusError) {
        if (statusError?.response?.status === 401) clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.debug("Auth check error:", error?.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      authCheckDoneRef.current = true;
    }
  }, [fetchCsrfToken, isLoading]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", { identifier: username, password });
      if (response?.success && response?.accessToken) {
        const token = response.accessToken;
        const expiresIn = response.expiresIn || 7200; // <-- use expiresIn from response
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
        // <-- ADDED: store expiry timestamp
        localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
        if (response.csrfToken) {
          localStorage.setItem("csrf_token", response.csrfToken);
          setCsrfToken(response.csrfToken);
        }
        const userData = response.user || response.data;
        if (userData) {
          localStorage.setItem("user_data", JSON.stringify(userData));
          setUser(userData);
        }
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

  const logout = async () => {
    try {
      await api.post("/users/logout").catch(() => { });
    } catch (_) { }
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setCsrfToken(null);
    window.location.href = "/login";
    return { success: true };
  };

  const refreshToken = async () => {
    const token = getStoredToken();
    if (!token || isTokenExpired()) return { success: false };
    try {
      const response = await api.post("/users/refresh");
      if (response?.success && response?.accessToken) {
        const newToken = response.accessToken;
        const expiresIn = response.expiresIn || 7200;
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("token", newToken);
        localStorage.setItem("token_expiry", Date.now() + expiresIn * 1000);
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

  // Role helpers (unchanged)
  const getUserRole = () => user?.role || "user";
  const hasRole = (requiredRole) => {
    const roleHierarchy = { user: 1, admin: 2, market_admin: 3, super_admin: 4, ceo: 5 };
    const userLevel = roleHierarchy[getUserRole()] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };
  const isAdmin = () => hasRole("admin");
  const isSuperAdmin = () => hasRole("super_admin");
  const isCEO = () => hasRole("ceo");
  const isMarketAdmin = () => hasRole("market_admin");

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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const decodeToken = (token) => decodeJWT(token);
export const getToken = () => getStoredToken();
export const getDecodedUserFromToken = () => {
  const token = getToken();
  return token ? decodeJWT(token) : null;
};

// SYNC check includes expiry
export const isLoggedIn = () => {
  const token = getStoredToken();
  return !!token && !isTokenExpired();
};

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000", color: "white" }}>Loading...</div>;
  if (!isAuthenticated) { window.location.href = "/login"; return null; }
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000", color: "white", textAlign: "center" }}>
        <div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => (window.location.href = "/")} style={{ marginTop: 20, padding: "10px 24px", background: "#ff3b3b", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Go Home</button>
        </div>
      </div>
    );
  }
  return children;
};

export const AdminRoute = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
export const SuperAdminRoute = ({ children }) => <ProtectedRoute requiredRole="super_admin">{children}</ProtectedRoute>;
export const CEORoute = ({ children }) => <ProtectedRoute requiredRole="ceo">{children}</ProtectedRoute>;