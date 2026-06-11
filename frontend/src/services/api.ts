import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api').trim();
const TOKEN_KEY = '@pi2026:token';

// API Client class para gerenciar requisições
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Define o token de autenticação
  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  // Obtém o token atual
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  // Método genérico para fazer requisições
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    // Adiciona token se disponível
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Trata erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || 'Erro na requisição',
          code: errorData.code || 'UNKNOWN_ERROR',
        };
      }

      // Retorna resposta JSON
      return await response.json();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error as ApiError;
      }

      const message =
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando e se o IP em .env está correto.'
          : 'Erro de conexão';

      throw { status: 500, message, code: 'NETWORK_ERROR' } satisfies ApiError;
    }
  }

  // Métodos HTTP convenientes
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instância única do cliente API
export const api = new ApiClient(API_BASE_URL);

// Tipo para erros da API
export interface ApiError {
  status: number;
  message: string;
  code: string;
}
