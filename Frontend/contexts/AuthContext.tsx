import React, { createContext, useContext, useState } from "react";

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
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
