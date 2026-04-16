import axios from 'axios';
import API from './config';

const api = axios.create({
  baseURL: API.BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: Auth Tokens  include access_token
api.interceptors.request.use((config) => {
  // Check for token 
  const token = localStorage.getItem('access_token') ||  
                localStorage.getItem('token') || 
                localStorage.getItem('leaderToken') || 
                localStorage.getItem('aspirant_token') ||
                localStorage.getItem('admin_token');
                
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  
  return config;
}, (error) => {
  return Promise.reject(error);
});


api.interceptors.response.use(
  (response) => {
   
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/users/refresh');
        
        if (refreshResponse && refreshResponse.success && refreshResponse.accessToken) {
          // Store the new token
          localStorage.setItem('access_token', refreshResponse.accessToken);
          localStorage.setItem('token', refreshResponse.accessToken);
          
          if (refreshResponse.csrfToken) {
            localStorage.setItem('csrf_token', refreshResponse.csrfToken);
          }
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('csrf_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('leaderToken');
        localStorage.removeItem('aspirant_token');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
    }
    
    const errorMsg = error.response?.data?.message || error.message;
    console.error(' [API Error]:', errorMsg);
    
    return Promise.reject(error);
  }
);

// Cache Keys & TTL (1 hour default)
const CACHE_KEY_PREFIX = 'siasahub_cache_';
const DEFAULT_TTL = 3600000;

// Helper to get cached data
api.getCachedData = (url) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + url);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    return data;
  } catch (e) {
    return null;
  }
};

// Helper to set cache data
api.setCachedData = (url, data) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + url, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error(' [Cache Error]:', e);
  }
};

// TTL management
const CACHE_TTL = 5 * 60 * 1000; // 5 min

api.getWithCache = async (url, onCacheHit, config = {}) => {
  const cached = api.getCachedData(url);
  const isCacheValid = cached && cached._cachedAt && (Date.now() - cached._cachedAt) < CACHE_TTL;

  if (isCacheValid && onCacheHit) {
    onCacheHit(cached);
  }

  try {
    const response = await api.get(url, config);

    const isValidResponse = response && (
      Array.isArray(response) ? response.length > 0 :
      (response.success !== false && response !== null)
    );

    if (isValidResponse) {
      const toCache = Array.isArray(response) ? response : { ...response, _cachedAt: Date.now() };
      if (!Array.isArray(toCache)) toCache._cachedAt = Date.now();
      api.setCachedData(url, toCache);
    }

    return response;
  } catch (error) {
    const status = error.response?.status;
    if (isCacheValid && status !== 404 && status !== 401 && status !== 403) {
      console.warn(`[Cache] Serving stale data for ${url} (status: ${status})`);
      return cached;
    }
    throw error;
  }
};

/**
 * Clean Cache 
 */
api.clearCache = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export default api;
