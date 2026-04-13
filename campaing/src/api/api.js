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

// Request interceptor: Auth Tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || 
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

// Response interceptor: Global Error Handling & Data extraction
api.interceptors.response.use(
  (response) => {
    // Return the response data directly as the component expects
    return response.data;
  },
  (error) => {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(' [API Error]:', errorMsg);
    
    // Handle specific errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
   
    }
    
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
    // Check if cache is still valid (optional, but SWR usually allows stale data)
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
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

api.getWithCache = async (url, onCacheHit, config = {}) => {
  // 1. Check cache — but only use if within TTL
  const cached = api.getCachedData(url);
  const isCacheValid = cached && cached._cachedAt && (Date.now() - cached._cachedAt) < CACHE_TTL;

  if (isCacheValid && onCacheHit) {
    onCacheHit(cached);
  }

  // 2. Always fetch fresh (Stale-While-Revalidate pattern)
  try {
    const response = await api.get(url, config);

    // Only cache successful, non-empty responses
    const isValidResponse = response && (
      Array.isArray(response) ? response.length > 0 :
      (response.success !== false && response !== null)
    );

    if (isValidResponse) {
      // Tag with timestamp for TTL checks
      const toCache = Array.isArray(response) ? response : { ...response, _cachedAt: Date.now() };
      if (!Array.isArray(toCache)) toCache._cachedAt = Date.now();
      api.setCachedData(url, toCache);
    }

    return response;
  } catch (error) {
    // Return stale cache on network failure (but not on 404/401 errors)
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
