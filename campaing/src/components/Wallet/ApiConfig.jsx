import axios from "axios";
const WALLET_API_BASE_URL = "http://localhost:8005/api/v1/wallet";

const walletApi = axios.create({
  baseURL: WALLET_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export default walletApi;
