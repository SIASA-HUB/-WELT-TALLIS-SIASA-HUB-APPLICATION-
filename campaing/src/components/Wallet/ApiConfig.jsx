// src/components/wallet/ApiConfig.jsx - Redirected
import axios from "axios";
import API from "../../api/config";

// Wallet service specifically uses Port 8008 via gateway /api/v1/wallet
const walletApi = axios.create({
  baseURL: API.WALLET,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export default walletApi;
