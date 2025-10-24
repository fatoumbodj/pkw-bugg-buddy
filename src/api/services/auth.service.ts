// Service d'authentification Backend Spring Boot
import { apiClient } from '../config/api-config';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

class AuthService {
  // Connexion
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials, false);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${response.user.firstName}!`,
        });
      }
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Inscription
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData, false);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast({
          title: "Inscription réussie",
          description: `Bienvenue ${response.user.firstName}!`,
        });
      }
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Mot de passe oublié
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        { email },
        false
      );
      
      toast({
        title: "Email envoyé",
        description: response.message || "Vérifiez votre boîte email",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Reset mot de passe
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/reset-password',
        { token, newPassword },
        false
      );
      
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez maintenant vous connecter",
      });
      
      return response;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Token invalide ou expiré",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Vérifier le token
  async verifyToken(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await apiClient.get<{ user: User }>('/auth/verify');
      return response.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté",
    });
  }

  // Utilisateur actuel
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Vérifier authentification
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Vérifier rôle admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}

export const authService = new AuthService();
