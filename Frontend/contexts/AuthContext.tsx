import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerForPushNotificationsAsync,
  sendPushTokenToBackend,
} from "@/services/notificationService";
import { codewordManager } from "@/services/codewordManager";

export type AppUser = {
  userId: string;
  email: string;
  name?: string;
  codeword?: string;
  codewordTrained?: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
};

const STORAGE_KEY = "sentrasense_user";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Läs sparad session vid uppstart
  useEffect(() => {
    async function loadUser() {
      try {
        let raw: string | null = null;
        if (Platform.OS === "web") {
          raw = localStorage.getItem(STORAGE_KEY);
        } else {
          raw = await AsyncStorage.getItem(STORAGE_KEY);
        }
        if (raw) setUserState(JSON.parse(raw) as AppUser);
      } catch {}
      setLoading(false);
    }
    loadUser();
  }, []);

  const setUser = async (newUser: AppUser | null) => {
    setUserState(newUser);
    try {
      if (Platform.OS === "web") {
        if (newUser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        if (newUser) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (user?.codeword) {
      codewordManager.setCodeword(user.codeword);
    }
  }, [user?.codeword]);

  useEffect(() => {
    async function registerPushTokenForLoggedInUser() {
      if (!user?.userId) return;
      const pushToken = await registerForPushNotificationsAsync();
      if (!pushToken) return;
      await sendPushTokenToBackend({ userId: user.userId, token: pushToken });
    }
    registerPushTokenForLoggedInUser();
  }, [user?.userId]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

