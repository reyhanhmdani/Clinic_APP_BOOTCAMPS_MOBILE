import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/clinic";

interface AuthState {
  isLogIn: boolean;
  token: string | null;
  user: User | null;
  logIn: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLogIn: false,
      token: null,
      user: null,
      logIn: (token, user) => set({ isLogIn: true, token, user }),
      logout: () => set({ isLogIn: false, token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
