import apiClient from './apiClient';
import { InventoryItem } from '../types/domain';

class InventoryService {
  /**
   * Lista todos os produtos
   */
  async listAll(): Promise<InventoryItem[]> {
    try {
      const response = await apiClient.get('/inventory');
      if (!Array.isArray(response.data)) {
        throw new Error('Resposta inválida do servidor ao listar produtos');
      }
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
      const response = await apiClient.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cria um novo produto
   */
  async create(data: {
    name: string;
    sku: string;
    unit: string;
    quantity: number;
    minStock: number;
    unitCost: number;
  }): Promise<InventoryItem> {
    try {
      const response = await apiClient.post('/inventory', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualiza um produto
   */
  async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await apiClient.put(`/inventory/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Ajusta quantidade em estoque
   */
  async adjustStock(id: string, quantity: number): Promise<InventoryItem> {
    try {
      const response = await apiClient.patch(`/inventory/${id}/adjust`, {
        quantity,
      });
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
      await apiClient.delete(`/inventory/${id}`);
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

export default new InventoryService();
