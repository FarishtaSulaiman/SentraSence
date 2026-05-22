import React, { createContext, useContext, useEffect, useState } from "react";
import {
  registerForPushNotificationsAsync,
  sendPushTokenToBackend,
} from "@/services/notificationService";

export type AppUser = {
  userId: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

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
