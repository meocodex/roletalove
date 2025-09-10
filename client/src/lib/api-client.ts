// Cliente API com autenticação automática

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

class ApiClient {
  private baseUrl = '';

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getHeaders(requireAuth);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          status: response.status,
          error: data.error || `HTTP ${response.status}`,
          message: data.message || 'Request failed',
        };
      }

      return {
        status: response.status,
        data,
        message: data.message,
      };

    } catch (error) {
      console.error('API request failed:', error);
      return {
        status: 0,
        error: 'Network error',
        message: 'Falha na conexão',
      };
    }
  }

  // Métodos de conveniência
  async get<T = any>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth);
  }

  async post<T = any>(endpoint: string, data?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  async put<T = any>(endpoint: string, data?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  async delete<T = any>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  }

  // Métodos específicos de autenticação
  async register(userData: {
    name: string;
    email: string;
    password: string;
    planType?: string;
  }) {
    return this.post('/api/auth/register', userData, false);
  }

  async login(credentials: {
    email: string;
    password: string;
  }) {
    return this.post('/api/auth/login', credentials, false);
  }

  async logout() {
    return this.post('/api/auth/logout', {}, true);
  }

  async getCurrentUser() {
    return this.get('/api/auth/me', true);
  }

  async refreshToken() {
    return this.post('/api/auth/refresh', {}, true);
  }

  // Métodos do sistema de roleta
  async getResults() {
    return this.get('/api/results');
  }

  async addResult(resultData: {
    number: number;
    source?: string;
    sessionId?: string;
  }) {
    return this.post('/api/results', resultData);
  }

  async getPatterns() {
    return this.get('/api/patterns');
  }

  async getStrategies() {
    return this.get('/api/strategies');
  }

  async getAlerts() {
    return this.get('/api/alerts');
  }

  async getSessionStats() {
    return this.get('/api/session/stats');
  }
}

export const apiClient = new ApiClient();

// Interceptor para renovar token automaticamente
export async function setupTokenRefresh() {
  // Implementar lógica de refresh automático se necessário
  // Por ora, deixar simples - o usuário precisa fazer login novamente se expirar
}