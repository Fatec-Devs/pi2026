import { api } from './api';
import { User } from '../types/domain';

// DTOs para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterClientRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;
  address?: string;
}

// Serviço de autenticação
class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Salva o token no cliente API
    await api.setToken(response.accessToken);
    
    return response;
  }

  /**
   * Registra um novo cliente
   */
  async registerClient(data: RegisterClientRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register-client', data);
    
    // Salva o token no cliente API
    await api.setToken(response.accessToken);
    
    return response;
  }

  /**
   * Obtém dados do usuário autenticado
   */
  async getMe(): Promise<User> {
    return await api.get<User>('/auth/me');
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    await api.setToken(null);
  }

  /**
   * Verifica se há um token salvo
   */
  async hasToken(): Promise<boolean> {
    const token = await api.getToken();
    return !!token;
  }
}

// Instância única do serviço
export const authService = new AuthService();
