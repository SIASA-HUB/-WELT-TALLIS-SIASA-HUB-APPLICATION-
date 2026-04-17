import axios from 'axios';
import API from './config';

const api = axios.create({
  baseURL: API.BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

const getToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

const storeAuthData = (data) => {
  if (!data) return;
  const token = data.accessToken || data.token;
  if (token) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    // Backward compatibility for different segments of the app
    localStorage.setItem('leaderToken', token);
    localStorage.setItem('aspirant_token', token);
    
    if (data.expiresIn) {
      localStorage.setItem('token_expiry', (Date.now() + data.expiresIn * 1000).toString());
    }
  }
  if (data.csrfToken) {
    localStorage.setItem('csrf_token', data.csrfToken);
  }
  const userData = data.user || data.leader || data.data?.leader;
  if (userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('leaderData', JSON.stringify(userData));
    const leaderId = userData.leader_id || userData.id;
    if (leaderId) localStorage.setItem('currentLeaderId', leaderId);
  }
};

const clearAuthData = () => {
  console.warn('[AUTH] Clearing session data');
  const keys = ['access_token', 'token', 'csrf_token', 'user_data', 'token_expiry',
    'leaderToken', 'aspirant_token', 'admin_token'];
  keys.forEach(k => localStorage.removeItem(k));
};

// Request interceptor – always send token if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor – handle 401 with refresh or redirect
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const token = getToken();
    
    // Detect if we are already trying to refresh or login to avoid loops
    const isRefreshCall = originalRequest.url.includes('/users/refresh');
    const isLoginCall = originalRequest.url.includes('/users/login');

    if (error.response?.status === 401 && !originalRequest._retry && token && !isRefreshCall && !isLoginCall) {
      originalRequest._retry = true;
      try {
        console.log('[AUTH] Token expired, attempting refresh...');
        // Use the instance but the _retry flag protects us from loops if we handle it carefully
        // or just use axios.post if preferred. Here we use api.post but the isRefreshCall check above prevents loops.
        const refreshResponse = await api.post('/users/refresh');
        
        if (refreshResponse?.success && refreshResponse?.accessToken) {
          console.log('[AUTH] Refresh successful');
          storeAuthData(refreshResponse);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[AUTH] Token refresh failed:', refreshError.message);
      }
      
      // If we reach here, refresh failed or was not possible
      clearAuthData();
      
      // Only redirect if we are not already on the login page
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

// ========== CACHE HELPERS (keep yours) ==========
const CACHE_KEY_PREFIX = 'siasahub_cache_';
api.getCachedData = (url) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + url);
    if (!cached) return null;
    const { data } = JSON.parse(cached);
    return data;
  } catch (e) { return null; }
};
api.setCachedData = (url, data) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + url, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) { console.error('[Cache Error]:', e); }
};
const CACHE_TTL = 5 * 60 * 1000;
api.getWithCache = async (url, onCacheHit, config = {}) => {
  const cached = api.getCachedData(url);
  const isCacheValid = cached && cached._cachedAt && (Date.now() - cached._cachedAt) < CACHE_TTL;
  if (isCacheValid && onCacheHit) onCacheHit(cached);
  try {
    const response = await api.get(url, config);
    const isValidResponse = response && (
      Array.isArray(response) ? response.length > 0 : (response.success !== false && response !== null)
    );
    if (isValidResponse) {
      const toCache = Array.isArray(response) ? response : { ...response, _cachedAt: Date.now() };
      api.setCachedData(url, toCache);
    }
    return response;
  } catch (error) {
    const status = error.response?.status;
    if (isCacheValid && status !== 404 && status !== 401 && status !== 403) {
      console.warn(`[Cache] Serving stale data for ${url}`);
      return cached;
    }
    throw error;
  }
};
api.clearCache = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) localStorage.removeItem(key);
  });
};

export { getToken, clearAuthData, storeAuthData };
export default api;