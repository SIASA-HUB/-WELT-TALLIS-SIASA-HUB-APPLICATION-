// hooks/useAuth.jsx - Unified Authentication System
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
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getStoredToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token") || getCookie("refresh_token");
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false; // If not JWT, assume valid (some session IDs)
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() > payload.exp * 1000;
  } catch {
    return false;
  }
};

const clearAuthData = () => {
  console.log('[AUTH] Clearing all local authentication data');
  const keys = [
    "access_token", "token", "refresh_token", "csrf_token", "user_data", "token_expiry",
    "leaderToken", "leaderData", "aspirant_token", "admin_token", "user_info", "isRegistered",
    "was_aspirant"
  ];
  keys.forEach(k => localStorage.removeItem(k));
  
  // Exhaustive cookie clearing
  const cookies = ["refresh_token", "user_info", "access_token", "csrf_secret"];
  cookies.forEach(c => {
    document.cookie = `${c}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    document.cookie = `${c}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
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

  // UNIFIED SESSION RESTORATION
  const restoreSession = useCallback(() => {
    // 1. Check User Session
    const userToken = getStoredToken();
    const storedUser = localStorage.getItem("user_data") || getCookie("user_info");
    const isRegistered = localStorage.getItem("isRegistered") === "true";

    if (userToken || storedUser || isRegistered) {
      try {
        let parsedUser = null;
        if (storedUser) {
          parsedUser = typeof storedUser === 'string' && storedUser.startsWith('{')
            ? JSON.parse(storedUser)
            : storedUser;
        }

        setUser(parsedUser);
        setIsAuthenticated(true);
        // Sync to localStorage if found in cookie
        if (storedUser && !localStorage.getItem("user_data")) {
          localStorage.setItem("user_data", typeof storedUser === 'string' ? storedUser : JSON.stringify(storedUser));
        }
      } catch (e) {
        console.error("Session restoration error:", e);
      }
    }

    // 2. Check Leader Session
    const leaderToken = localStorage.getItem("leaderToken");
    const storedLeader = localStorage.getItem("leaderData");
    if (leaderToken || storedLeader) {
      try {
        const parsedRaw = storedLeader ? JSON.parse(storedLeader) : null;
        const parsed = parsedRaw?.leader || parsedRaw;
        setLeader(parsed);
        setIsLeaderAuthenticated(true);
      } catch (e) { }
    }
  }, []);

  const setUserSession = useCallback((data) => {
    if (!data) return;
    setUser(data);
    setIsAuthenticated(true);
    localStorage.setItem("user_data", JSON.stringify(data));
    localStorage.setItem("isRegistered", "true");
  }, []);

  const setLeaderSession = useCallback((data) => {
    if (!data) return;
    const actualLeader = data.leader || data;
    setLeader(actualLeader);
    setIsLeaderAuthenticated(true);
    localStorage.setItem("leaderData", JSON.stringify(actualLeader));
    
    const token = data.token || data.accessToken || actualLeader.token;
    if (token) {
      localStorage.setItem("leaderToken", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
    }
  }, []);



  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/users/me");
      if (response?.success && response?.data) {
        setUserSession(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      if (error?.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
      return null;
    }
  }, [setUserSession]);

  const checkAuthStatus = useCallback(async (force = false) => {
    if (authCheckDoneRef.current && !force) return;

    setIsLoading(true);
    try {
      const token = getStoredToken();
      const leaderToken = localStorage.getItem("leaderToken");

      if (token) {
        await fetchUser();
      }

      if (leaderToken) {
        try {
          const res = await api.get("/leaders/profile/me");
          if (res?.success && res?.data) {
            setLeaderSession(res.data);
          }
        } catch (e) { }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
      authCheckDoneRef.current = true;
    }
  }, [fetchUser, setLeaderSession]);

  useEffect(() => {
    restoreSession();
    checkAuthStatus();
  }, [restoreSession, checkAuthStatus]);

  const login = async (username, password) => {
    try {
      const response = await api.post("/users/login", { identifier: username, password });
      if (response?.success && response?.accessToken) {
        const token = response.accessToken;
        localStorage.setItem("access_token", token);
        const userData = response.user || response.data;
        setUserSession(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response?.message || "Login failed" };
    } catch (error) {
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

    clearAuthData();
    window.location.href = "/login";
    return { success: true };
  };

  const value = {
    user,
    leader,
    isAuthenticated,
    isLeaderAuthenticated,
    isLoading,
    csrfToken,
    login,
    logout,
    checkAuthStatus,
    fetchUser,
    setUserSession,
    setLeaderSession,
    hasRole: (role) => {
      const normalizedRole = role?.toLowerCase();
      const userRole = (user?.role || leader?.role || "").toLowerCase();
      
      if (normalizedRole === 'aspirant' || normalizedRole === 'leader') return isLeaderAuthenticated;
      if (normalizedRole === 'admin') return userRole === 'admin' || userRole === 'super_admin';
      if (normalizedRole === 'market_admin') return userRole === 'market_admin' || userRole === 'admin';
      
      // CRITICAL FIX: Leaders are also "users" for shopping/wallet purposes
      if (normalizedRole === 'user') return isAuthenticated || isLeaderAuthenticated;
      
      return false;
    },
    isAdmin: () => {
      const r = (user?.role || "").toLowerCase();
      return r === 'admin' || r === 'super_admin';
    },
    isMarketAdmin: () => (user?.role || "").toLowerCase() === 'market_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const getToken = () => getStoredToken();
export const isLoggedIn = () => !!getStoredToken() || localStorage.getItem("isRegistered") === "true";
