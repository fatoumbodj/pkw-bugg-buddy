import React, { createContext, useContext, useState, ReactNode } from "react";
import { AdminUser, adminLogin, getCurrentUser, logout as apiLogout } from "@/hooks/useAdminAuthentification";

type AuthContextType = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => getCurrentUser());

  const login = async (email: string, password: string) => {
    try {
      const res = await adminLogin(email, password);
      setUser(res.admin);
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
