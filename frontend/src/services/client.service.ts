import { api } from './api';
import { Client } from '../types/domain';

// Serviço de clientes
class ClientService {
  /**
   * Obtém o cliente do usuário autenticado
   */
  async getMe(): Promise<Client> {
    return await api.get<Client>('/clients/me');
  }

  /**
   * Obtém cliente por ID (só admin)
   */
  async getById(id: string): Promise<Client> {
    return await api.get<Client>(`/clients/${id}`);
  }

  /**
   * Lista todos os clientes (só admin)
   */
  async list(): Promise<{ clients: Client[]; total: number }> {
    return await api.get<{ clients: Client[]; total: number }>('/clients');
  }

  /**
   * Cria um novo cliente (só admin)
   */
  async create(data: {
    userId?: string;
    document?: string;
    address?: string;
    notes?: string;
  }): Promise<Client> {
    return await api.post<Client>('/clients', data);
  }

  /**
   * Atualiza um cliente (só admin)
   */
  async update(
    id: string,
    data: {
      document?: string;
      address?: string;
      notes?: string;
    }
  ): Promise<Client> {
    return await api.put<Client>(`/clients/${id}`, data);
  }

  /**
   * Remove um cliente (só admin)
   */
  async delete(id: string): Promise<{ message: string }> {
    return await api.delete<{ message: string }>(`/clients/${id}`);
  }
}

// Instância única do serviço
export const clientService = new ClientService();
