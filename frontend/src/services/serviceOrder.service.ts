import { api } from './api';
import { ServiceOrder, ServiceItemInput } from '../types/domain';

// DTOs para Service Orders
export interface CreateServiceOrderRequest {
  clientId: string;
  machineId: string;
  services: ServiceItemInput[];
  notes?: string;
}

export interface CreateServiceOrderResponse {
  serviceOrder: ServiceOrder;
  message: string;
}

export interface ServiceOrderListResponse {
  serviceOrders: ServiceOrder[];
  total: number;
}

// Serviço de Ordens de Serviço
class ServiceOrderService {
  /**
   * Cria uma nova ordem de serviço
   */
  async create(data: CreateServiceOrderRequest): Promise<ServiceOrder> {
    const response = await api.post<CreateServiceOrderResponse>(
      '/service-orders',
      data
    );
    return response.serviceOrder;
  }

  /**
   * Lista todas as ordens de serviço (admin)
   */
  async list(): Promise<ServiceOrder[]> {
    const response = await api.get<ServiceOrderListResponse>('/service-orders');
    return response.serviceOrders;
  }

  /**
   * Obtém uma ordem de serviço por ID
   */
  async getById(id: string): Promise<ServiceOrder> {
    return await api.get<ServiceOrder>(`/service-orders/${id}`);
  }

  /**
   * Lista histórico de ordens de serviço de um cliente
   */
  async getClientHistory(clientId: string): Promise<ServiceOrder[]> {
    const response = await api.get<ServiceOrderListResponse>(
      `/service-orders/client/${clientId}/history`
    );
    return response.serviceOrders;
  }

  /**
   * Atualiza o status de uma ordem de serviço (admin)
   */
  async updateStatus(
    id: string,
    status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO'
  ): Promise<ServiceOrder> {
    return await api.patch<ServiceOrder>(`/service-orders/${id}/status`, {
      status,
    });
  }

  /**
   * Adiciona materiais a uma ordem de serviço (admin)
   */
  async addMaterials(
    id: string,
    materials: Array<{
      inventoryItemId: string;
      quantity: number;
      unitCost: number;
    }>
  ): Promise<ServiceOrder> {
    return await api.patch<ServiceOrder>(`/service-orders/${id}/materials`, {
      materials,
    });
  }

  /**
   * Atualiza custos de uma ordem de serviço (admin)
   */
  async updateCosts(
    id: string,
    costs: {
      laborCost: number;
      partsCost: number;
      totalCost: number;
    }
  ): Promise<ServiceOrder> {
    return await api.patch<ServiceOrder>(`/service-orders/${id}/costs`, costs);
  }
}

// Instância única do serviço
export const serviceOrderService = new ServiceOrderService();
