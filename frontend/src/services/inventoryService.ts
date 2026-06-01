import axios, { AxiosInstance } from 'axios';
import { InventoryItem } from '../types/domain';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class InventoryService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/inventory`,
    });
  }

  /**
   * Lista todos os produtos em estoque (requer autenticação ADMIN)
   */
  async listAll(): Promise<InventoryItem[]> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtém um produto por ID
   */
  async getById(id: string): Promise<InventoryItem> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cria um novo produto no inventário
   * @param data Dados do produto
   */
  async create(data: {
    name: string;
    sku: string;
    unit: string;
    quantity: number;
    minStock: number;
    unitCost: number;
    active?: boolean;
  }): Promise<InventoryItem> {
    try {
      const response = await this.api.post('/', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualiza um produto existente
   */
  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await this.api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Ajusta a quantidade em estoque
   * @param id ID do produto
   * @param quantity Quantidade a adicionar (positivo) ou remover (negativo)
   */
  async adjustStock(id: string, quantity: number): Promise<InventoryItem> {
    try {
      const response = await this.api.patch(`/${id}/adjust`, { quantity });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deleta um produto
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

export default new InventoryService();
