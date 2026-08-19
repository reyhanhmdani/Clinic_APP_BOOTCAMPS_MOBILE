import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL = Platform.select({
  android: "http://10.0.2.2:3000/api/v1", // Khusus Android Emulator (10.0.2.2 mengarah ke localhost PC)
  ios: "http://localhost:3000/api/v1", // iOS Simulator
  default: "http://localhost:3000/api/v1", // Web / Default
  // default: "http://192.168.1.XX:3000/api/v1",
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tempelkan JWT Token otomatis ke Authorization header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
