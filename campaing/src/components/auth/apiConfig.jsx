// src/utils/apiConfig.js
import axios from "axios";

const API_BASE_URL = axios.create({
  baseURL: "http://localhost:8004/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add request interceptor for debugging
API_BASE_URL.interceptors.request.use(
  (config) => {
    console.log(
      "📤 API Request:",
      config.method.toUpperCase(),
      config.url,
      config.data,
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
API_BASE_URL.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "❌ Response Error:",
      error.response?.status,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default API_BASE_URL;
