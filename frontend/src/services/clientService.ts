import { api } from './api';
import { Client } from '../types/domain';

class ClientService {
  /**
   * Lista todos os clientes (requer autenticação ADMIN)
   */
  async listAll(): Promise<Client[]> {
    try {
      const response = await api.get<{ clients: Client[]; total: number }>('/clients');
      if (!response.clients || !Array.isArray(response.clients)) {
        throw new Error('Resposta inválida do servidor ao listar clientes');
      }
      return response.clients;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtém o cliente do usuário autenticado
   */
  async getMe(): Promise<Client> {
    try {
      const response = await api.get<Client>('/clients/me');
      if (!response) {
        throw new Error('Resposta inválida do servidor ao obter cliente');
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtém um cliente por ID
   */
  async getById(id: string): Promise<Client> {
    try {
      const response = await api.get<Client>(`/clients/${id}`);
      if (!response) {
        throw new Error('Resposta inválida do servidor ao obter cliente');
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cria um novo cliente
   */
  async create(data: {
    userId: string;
    document?: string;
    address?: string;
    notes?: string;
  }): Promise<Client> {
    try {
      const response = await api.post<Client>('/clients', data);
      if (!response) {
        throw new Error('Resposta inválida do servidor ao criar cliente');
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async update(id: string, data: Partial<Client>): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clients/${id}`, data);
      if (!response) {
        throw new Error('Resposta inválida do servidor ao atualizar cliente');
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deleta um cliente
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(error.message as string);
    }
    return new Error('Erro ao conectar com o servidor');
  }
}

export default new ClientService();
