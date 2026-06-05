import apiClient from './apiClient';
import { Client } from '../types/domain';

class ClientService {
  /**
   * Lista todos os clientes (requer autenticação ADMIN)
   */
  async listAll(): Promise<Client[]> {
    try {
      const response = await apiClient.get('/clients');
      if (!Array.isArray(response.data)) {
        throw new Error('Resposta inválida do servidor ao listar clientes');
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtém um cliente por ID
   */
  async getById(id: string): Promise<Client> {
    try {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data;
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
      const response = await apiClient.post('/clients', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async update(id: string, data: Partial<Client>): Promise<Client> {
    try {
      const response = await apiClient.put(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deleta um cliente
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/clients/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      return new Error(data?.message || `Erro: ${status}`);
    }
    return new Error('Erro ao conectar com o servidor');
  }
}

export default new ClientService();
