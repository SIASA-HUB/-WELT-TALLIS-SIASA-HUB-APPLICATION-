// services/walletApi.js

import axios from "axios";

// Wallet Service API Configuration
const WALLET_API_BASE_URL = "http://localhost:8004/api/v1/users";

const walletApi = axios.create({
  baseURL: WALLET_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Include cookies for authentication
});

export default walletApi;
