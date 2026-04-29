// src/components/wallet/ApiConfig.jsx - Fixed with token expiry handling
import axios from "axios";
import API from "../../api/config";

// ========== Token helpers (same as main api.js) ==========
const getToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("token");
};

const isTokenExpired = () => {
  const expiry = localStorage.getItem("token_expiry");
  if (!expiry) return false;
  const parsedExpiry = parseInt(expiry);
  if (isNaN(parsedExpiry)) return false;


  if (parsedExpiry < 1704067200000) return false;

  return Date.now() > parsedExpiry;
};

const clearAuthData = () => {
  console.warn('[AUTH] Clearing session data from Wallet API');
  const keys = ["access_token", "token", "csrf_token", "user_data", "token_expiry",
    "leaderToken", "aspirant_token", "admin_token"];
  keys.forEach(k => localStorage.removeItem(k));
};
// ========================================================

const walletApi = axios.create({
  baseURL: API.WALLET,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor – always send token if present
walletApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor – handle 401 same as main api
walletApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const token = getToken();

    // Safety: ignore calls that are part of auth flow to prevent loops
    const isAuthCall = originalRequest.url.includes('/users/refresh') ||
      originalRequest.url.includes('/users/login');

    if (error.response?.status === 401 && !originalRequest._retry && token && !isAuthCall) {
      originalRequest._retry = true;
      try {
        console.log('[AUTH] Wallet API encountered 401, attempting refresh via main API...');
        // Import main api client for refresh
        const mainApi = (await import("../../api/api")).default;
        const refreshResponse = await mainApi.post("/users/refresh");

        if (refreshResponse?.success && refreshResponse?.accessToken) {
          // Note: mainApi already updates localStorage
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
          return walletApi(originalRequest);
        }
      } catch (refreshError) {
        console.error("Wallet Auth refresh failed:", refreshError.message);
      }

      clearAuthData();
      const isAspirant = window.location.pathname.startsWith('/aspirant');
      const loginPath = isAspirant ? '/login-aspirant' : '/login';
      if (!window.location.pathname.includes(loginPath)) {
        window.location.href = loginPath;
      }
    }

    const errorMsg = error.response?.data?.message || error.message;
    return Promise.reject(error);
  }
);

export default walletApi;