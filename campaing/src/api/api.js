import axios from 'axios';

// All frontend calls will go through the Vite proxy (/api) 
// which is directed to the API Gateway (localhost:8009)
const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding tokens if they are not in cookies
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('leaderToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
