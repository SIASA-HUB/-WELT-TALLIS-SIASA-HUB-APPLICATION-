import axios from "axios";

const USERS_URL = "http://localhost:8004/api/v1";

const userApi = axios.create({
  baseURL: USERS_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export default userApi;
