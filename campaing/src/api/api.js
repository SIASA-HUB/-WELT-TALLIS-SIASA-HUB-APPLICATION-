import axios from 'axios';
import API from './config';

const api = axios.create({
  baseURL: API.BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

const getToken = (url = "") => {
  const leaderToken = localStorage.getItem('leaderToken');
  const userToken = localStorage.getItem('access_token') || localStorage.getItem('token');

  // 1. If it's a leader or manifesto specific request, prioritize leaderToken
  if (url.includes('/leaders/') || url.includes('/manifestos/')) {
    return leaderToken || userToken;
  }
  
  // 2. Fallback: if we have a leader token but no user token, use it for all requests
  // This ensures aspirants can access shared services like rallies/endorsements
  if (leaderToken && !userToken) return leaderToken;

  return userToken;
};

const storeAuthData = (data) => {
  if (!data) return;
  const token = data.accessToken || data.token;
  if (token) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    if (data.expiresIn) {
      localStorage.setItem('token_expiry', (Date.now() + data.expiresIn * 1000).toString());
    }
  }
  if (data.csrfToken) {
    localStorage.setItem('csrf_token', data.csrfToken);
  }
  const userData = data.user || data.data;
  if (userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
};

const storeLeaderAuthData = (data) => {
  if (!data) return;
  const token = data.accessToken || data.token;
  if (token) {
    localStorage.setItem('leaderToken', token);
  }
  const leaderData = data.leader || data.data?.leader || data.data;
  if (leaderData) {
    localStorage.setItem('leaderData', JSON.stringify(leaderData));
    const leaderId = leaderData.leader_id || leaderData.id;
    if (leaderId) localStorage.setItem('currentLeaderId', leaderId);
  }
};

const clearAuthData = (target = 'all') => {
  console.warn(`[AUTH] Clearing ${target} session data`);
  const userKeys = ['access_token', 'token', 'csrf_token', 'user_data', 'token_expiry'];
  const leaderKeys = ['leaderToken', 'aspirant_token', 'leaderData', 'currentLeaderId'];
  
  if (target === 'user' || target === 'all') {
    userKeys.forEach(k => localStorage.removeItem(k));
  }
  if (target === 'leader' || target === 'all') {
    leaderKeys.forEach(k => localStorage.removeItem(k));
  }
};

// Request interceptor – always send token if present
api.interceptors.request.use((config) => {
  const token = getToken(config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // CRITICAL: When sending FormData (file uploads), remove the default
  // Content-Type so the browser auto-sets multipart/form-data with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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
        
        // ONLY clear data if the backend explicitly says the refresh token is dead
        const status = refreshError.response?.status;
        if (status === 401 || status === 403) {
          console.warn('[AUTH] Refresh token invalid or expired. Logging out.');
          
          // Determine target to clear based on the failed request URL
          const isLeaderRequest = originalRequest.url.includes('/leaders/');
          const target = isLeaderRequest ? 'leader' : 'user';
          
          clearAuthData(target);
          
          // Redirect to login only if not already there
          const loginPath = isLeaderRequest ? '/login-aspirant' : '/login';
          if (!window.location.pathname.includes(loginPath)) {
            window.location.href = loginPath;
          }
        } else {
          console.warn('[AUTH] Refresh failed due to network/server error. Keeping session for retry.');
        }
      }
      return Promise.reject(error);
    }

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
api.getWithCache = async (url, onData, config = {}) => {
  const cacheKey = CACHE_KEY_PREFIX + url;
  let cachedData = null;
  let isCacheValid = false;

  try {
    const rawCache = localStorage.getItem(cacheKey);
    if (rawCache) {
      const { data, timestamp } = JSON.parse(rawCache);
      cachedData = data;
      isCacheValid = (Date.now() - timestamp) < CACHE_TTL;
    }
  } catch (e) { console.error('[Cache Read Error]:', e); }
  
  // 1. Deliver cached data immediately (even if stale, to prevent empty states)
  if (cachedData && onData) {
    onData(cachedData);
  }

  // If cache is valid and we have data, we could skip network if we wanted strict cache,
  // but for SWR (Stale-While-Revalidate), we always fetch.

  try {
    // 2. Fetch fresh data from network
    const response = await api.get(url, config);
    const isValidResponse = response && (
      Array.isArray(response) ? response.length > 0 : (response.success !== false && response !== null)
    );

    if (isValidResponse) {
      api.setCachedData(url, response);
      
      // 3. Deliver fresh data to component
      if (onData) onData(response);
    }
    return response;
  } catch (error) {
    const status = error.response?.status;
    // If network fails, fallback to stale cache as last resort
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

export { getToken, clearAuthData, storeAuthData, storeLeaderAuthData };
export default api;