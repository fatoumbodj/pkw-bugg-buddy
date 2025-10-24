// Configuration API - Backend Node.js sur port 3000
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000/api",
  ADMIN_BASE_URL: "http://localhost:3000/api/admin",
  TIMEOUT: 30000,
};

// Headers avec authentification JWT
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Client HTTP générique
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    withAuth = true
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = withAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erreur ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Gestion des erreurs d'authentification
      if (error.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, withAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, withAuth);
  }

  async post<T>(endpoint: string, data?: any, withAuth = true): Promise<T> {
    return this.request<T>(
      endpoint, 
      { method: 'POST', body: data ? JSON.stringify(data) : undefined },
      withAuth
    );
  }

  async put<T>(endpoint: string, data: any, withAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(data) },
      withAuth
    );
  }

  async delete<T>(endpoint: string, withAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, withAuth);
  }
}

export const apiClient = new ApiClient();
