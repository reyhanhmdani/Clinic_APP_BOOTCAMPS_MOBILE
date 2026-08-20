import axios from "axios";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";

const PORT = 3000;
const LOCAL_WIFI_IP = "192.168.18.249"; // Sesuaikan dengan IP Wi-Fi laptop

const DEV_URL = Platform.select({
  android: `http://${LOCAL_WIFI_IP}:${PORT}/api/v1`,
  ios: `http://localhost:${PORT}/api/v1`,
  default: `http://${LOCAL_WIFI_IP}:${PORT}/api/v1`,
});

export const api = axios.create({
  baseURL: DEV_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Tempelkan token otomatis dari Zustand
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tangani token expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      router.replace("/");
    }
    return Promise.reject(error);
  }
);

export default api;
