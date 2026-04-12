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


api.getWithCache = async (url, onCacheHit, config = {}) => {
  // 1. Check Cache
  const cached = api.getCachedData(url);
  if (cached && onCacheHit) {
    onCacheHit(cached);
  }

  // 2. Fetch Fresh
  try {
    const response = await api.get(url, config);
    // 3. Update Cache
    api.setCachedData(url, response);
    return response;
  } catch (error) {
    // If we have cached data, don't throw if network fails 
    if (cached) return cached;
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
