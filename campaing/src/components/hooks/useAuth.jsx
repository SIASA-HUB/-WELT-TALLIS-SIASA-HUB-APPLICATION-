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
  const [leader, setLeader] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLeaderAuthenticated, setIsLeaderAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const authCheckDoneRef = useRef(false);

  // OPTIMISTIC AUTH: detect sessions from localStorage immediately
  useEffect(() => {
    // User Session
    const userToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");
    if (userToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) { }
    }

    // Leader Session
    const leaderToken = localStorage.getItem("leaderToken");
    const storedLeader = localStorage.getItem("leaderData");
    if (leaderToken && storedLeader) {
      try {
        const parsed = JSON.parse(storedLeader);
        setLeader(parsed);
        setIsLeaderAuthenticated(true);
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

  const fetchLeader = useCallback(async () => {
    const token = localStorage.getItem("leaderToken");
    if (!token) return null;
    try {
      const response = await api.get("/leaders/profile/me");
      if (response?.success && response?.data) {
        setLeader(response.data);
        setIsLeaderAuthenticated(true);
        localStorage.setItem("leaderData", JSON.stringify(response.data));
        return response.data;
      } else {
        // Non-success but not a thrown error – could be a soft 400/404
        // Only clear if it's clearly an auth rejection (no data at all)
        console.warn("[AUTH] Leader profile returned non-success, keeping optimistic session.");
        return null;
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        // Explicit auth rejection – clear the leader session
        console.warn("[AUTH] Leader token rejected by server, clearing leader session.");
        setIsLeaderAuthenticated(false);
        setLeader(null);
        localStorage.removeItem("leaderToken");
        localStorage.removeItem("leaderData");
        localStorage.removeItem("currentLeaderId");
      } else {
        // Network error or 500 – keep the optimistic state loaded from localStorage
        console.warn("[AUTH] Leader auth check failed (network/server), keeping cached session.", error.message);
      }
      return null;
    }
  }, []);

  const checkAuthStatus = useCallback(async (force = false) => {
    if (authCheckDoneRef.current && !force) return;
    try {
      const token = getStoredToken();
      const leaderToken = localStorage.getItem("leaderToken");

      if (!token && !leaderToken) {
        setIsLoading(false);
        authCheckDoneRef.current = true;
        return;
      }

      // Try to fetch fresh user data if token exists
      if (token) {
        const userData = await fetchUser();
        if (userData) {
          await fetchCsrfToken();
          // Do not return early; we might also have a leader session to check
        } else {
          // If fetchUser failed but we still have token, try to refresh
          const refreshResponse = await api.post("/users/refresh").catch(() => null);
          if (refreshResponse?.success && refreshResponse?.accessToken) {
            console.log("[AUTH] Refresh successful in checkAuthStatus");
            const newToken = refreshResponse.accessToken;
            localStorage.setItem("access_token", newToken);
            localStorage.setItem("token", newToken);
            
            const newUser = await fetchUser();
            if (newUser) {
              setIsAuthenticated(true);
              setUser(newUser);
            }
          } else {
            // Refresh failed
            if (token && isTokenExpired(token)) {
              console.warn("[AUTH] Session expired and refresh failed.");
              localStorage.removeItem("access_token");
              localStorage.removeItem("token");
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      }

      // Try to fetch fresh leader data if leaderToken exists
      if (leaderToken) {
        await fetchLeader();
      }

    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
      authCheckDoneRef.current = true;
    }
  }, [fetchUser, fetchLeader, fetchCsrfToken]);

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

  const logout = async (target = 'all') => {
    try {
      if (target === 'user' || target === 'all') {
        await api.post("/users/logout").catch(() => { });
        setUser(null);
        setIsAuthenticated(false);
      }
      if (target === 'leader' || target === 'all') {
        await api.post("/leaders/logout").catch(() => { });
        setLeader(null);
        setIsLeaderAuthenticated(false);
      }
    } catch (_) { }

    // surgical clear
    const { clearAuthData } = await import("../../api/api");
    clearAuthData(target);

    if (target === 'all' || (target === 'user' && !isLeaderAuthenticated)) {
      window.location.href = "/login";
    } else if (target === 'leader') {
      window.location.href = "/login-aspirant";
    }
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
  const getUserRole = () => {
    if (user?.role) return user.role;
    if (isLeaderAuthenticated) return "aspirant";
    return "user";
  };


  const hasRole = (requiredRole) => {
    if (!requiredRole) return true;
    
    // Normalize roles to lowercase for case-insensitive comparison
    const currentUserRole = (getUserRole() || "user").toLowerCase();
    const normalizedRequiredRole = requiredRole.toLowerCase();

    // Special case: aspirant/leader is NOT in the user hierarchy
    if (normalizedRequiredRole === 'aspirant' || normalizedRequiredRole === 'leader') {
      return isLeaderAuthenticated;
    }

    // If we're checking a user role but user is not authenticated as a normal user,
    // allow if they are authenticated as a leader (leaders should have user-level access)
    if (!isAuthenticated && !isLeaderAuthenticated) {
      return false;
    }

    // UPDATED HIERARCHY: admin (3) is now higher than market_admin (2)
    const roleHierarchy = { 
      user: 1, 
      market_admin: 2, 
      admin: 3, 
      super_admin: 4, 
      ceo: 5 
    };

    const userLevel = roleHierarchy[currentUserRole] || 0;
    const requiredLevel = roleHierarchy[normalizedRequiredRole] || 0;
    
    // If requiredRole is not in hierarchy and not aspirant, deny by default if level is 0
    if (requiredLevel === 0 && normalizedRequiredRole !== 'user') return false;

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
    leader,
    isAuthenticated,
    isLeaderAuthenticated,
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