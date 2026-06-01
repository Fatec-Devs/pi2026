import axios, { AxiosInstance } from 'axios';
import { Client } from '../types/domain';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ClientService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/clients`,
    });
  }

  /**
   * Lista todos os clientes (requer autenticação ADMIN)
   */
  async listAll(): Promise<Client[]> {
    try {
      const response = await this.api.get('/');
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
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cria um novo cliente
   * @param data Dados do cliente (documento, endereço, notas)
   */
  async create(data: {
    document?: string;
    address?: string;
    notes?: string;
    userId: string;
  }): Promise<Client> {
    try {
      const response = await this.api.post('/', data);
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
      const response = await this.api.put(`/${id}`, data);
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
      await this.api.delete(`/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Trata erros da API
   */
  private handleError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      return new Error(
        data?.message || `Erro na requisição: ${status}`
      );
    }
    return new Error('Erro ao conectar com o servidor');
  }
}

export default new ClientService();
