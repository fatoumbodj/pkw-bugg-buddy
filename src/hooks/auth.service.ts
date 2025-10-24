// src/hooks/auth.service.ts
import { ENDPOINTS } from "./endpoints";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

// Login
export const adminLogin = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(ENDPOINTS.adminLogin, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erreur de connexion");
  if (!data.data?.token) throw new Error("Token manquant");

  localStorage.setItem("token", data.data.token);
  localStorage.setItem("admin", JSON.stringify(data.data.admin));

  return {
    token: data.data.token,
    admin: data.data.admin,
  };
};

// Récupérer admin connecté
export const getCurrentUser = (): AdminUser | null => {
  const admin = localStorage.getItem("admin");
  return admin ? JSON.parse(admin) : null;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
};
