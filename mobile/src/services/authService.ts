import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface loginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const loginService = async (input: loginInput): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse }>(`/auth/login`, input);
  const authData = response.data.data;

  if (authData.token) {
    await AsyncStorage.setItem("token", authData.token);
    await AsyncStorage.setItem("user", JSON.stringify(authData.user));
  }

  return authData;
};

export const logoutService = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
