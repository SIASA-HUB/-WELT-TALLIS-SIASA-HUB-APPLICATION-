// hooks/useAuth.jsx - Stable, keeps you logged in even when backend fails
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

// ========== HELPERS ==========
const getStoredToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token");
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() > payload.exp * 1000;
  } catch {
    return true;
  }
};

const clearAuthData = () => {
  console.log('[AUTH] Clearing all local authentication data');
  const keys = [
    "access_token", "token", "csrf_token", "user_data", "token_expiry",
    "leaderToken", "aspirant_token", "admin_token"
  ];
  keys.forEach(k => localStorage.removeItem(k));
};

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
// =================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const authCheckDoneRef = useRef(false);

  // OPTIMISTIC AUTH: if token and user_data exist, assume logged in immediately
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = localStorage.getItem("user_data");
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) { }
    }
  }, []);

  const fetchCsrfToken = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return null;
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
    if (!token) return null;
    try {
      const response = await api.get("/users/me");
      if (response?.success && response?.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        localStorage.setItem("user_data", JSON.stringify(response.data));
        return response.data;
      } else {
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        // Do NOT clearAuthData here – let the refresh logic in checkAuthStatus handle it
        console.log("[AUTH] /me returned 401, checkAuthStatus will attempt refresh");
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // 500, network error, etc. – keep existing user (do not log out)
        console.warn("Auth check network/server error, using cached user", error.message);
        // Keep the current user from localStorage (already set optimistically)
      }
      return null;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckDoneRef.current) return;
    try {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // Try to fetch fresh user data
      const userData = await fetchUser();
      if (userData) {
        await fetchCsrfToken();
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // If fetchUser failed but we still have token, try to refresh
      const refreshResponse = await api.post("/users/refresh").catch(() => null);
      if (refreshResponse?.success && refreshResponse?.accessToken) {
        console.log("[AUTH] Refresh successful in checkAuthStatus");
        const newToken = refreshResponse.accessToken;
        storeAuthData(refreshResponse); // Use helper for consistency

        // Retry fetch user after refresh
        const newUser = await fetchUser();
        if (newUser) {
          setIsAuthenticated(true);
          setUser(newUser);
        }
      } else {
        // Refresh failed (401 or other)
        const token = getStoredToken();
        if (token && isTokenExpired(token)) {
          console.warn("[AUTH] Session expired and refresh failed. Clearing.");
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        } else {
          console.log("[AUTH] Refresh failed but token still valid (optimistic fallback)");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // On any unexpected error, keep existing user (don't log out)
    } finally {
      setIsLoading(false);
      authCheckDoneRef.current = true;
    }
  }, [fetchUser, fetchCsrfToken]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", { identifier: username, password });
      if (response?.success && response?.accessToken) {
        const token = response.accessToken;
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
        if (response.expiresIn) {
          localStorage.setItem("token_expiry", Date.now() + response.expiresIn * 1000);
        }
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
    if (!token) return { success: false };
    try {
      const response = await api.post("/users/refresh");
      if (response?.success && response?.accessToken) {
        const newToken = response.accessToken;
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("token", newToken);
        if (response.expiresIn) {
          localStorage.setItem("token_expiry", Date.now() + response.expiresIn * 1000);
        }
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

  // Role helpers
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

export const isLoggedIn = () => {
  const token = getStoredToken();
  return !!token;
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