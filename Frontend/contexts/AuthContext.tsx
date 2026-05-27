import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
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
  setUser: (user: AppUser | null) => void;
};

const STORAGE_KEY = "sentrasense_user";

function readPersistedUser(): AppUser | null {
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    }
  } catch {}
  return null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(readPersistedUser);

  const setUser = (newUser: AppUser | null) => {
    setUserState(newUser);
    try {
      if (Platform.OS === "web") {
        if (newUser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        } else {
          localStorage.removeItem(STORAGE_KEY);
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
      if (!user?.userId) {
        return;
      }

      const pushToken = await registerForPushNotificationsAsync();

      if (!pushToken) {
        return;
      }

      await sendPushTokenToBackend({
        userId: user.userId,
        token: pushToken,
      });
    }

    registerPushTokenForLoggedInUser();
  }, [user?.userId]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
