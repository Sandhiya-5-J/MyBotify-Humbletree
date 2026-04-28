import axios from "axios";
import { getToken, removeToken } from "@/lib/auth";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/signup";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
