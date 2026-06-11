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
    if (!response.serviceOrder) {
      throw new Error('Resposta inválida do servidor ao criar ordem de serviço');
    }
    return response.serviceOrder;
  }

  /**
   * Lista todas as ordens de serviço (admin)
   */
  async list(): Promise<ServiceOrder[]> {
    const response = await api.get<ServiceOrderListResponse>('/service-orders');
    if (!response.serviceOrders || !Array.isArray(response.serviceOrders)) {
      throw new Error('Resposta inválida do servidor ao listar ordens de serviço');
    }
    return response.serviceOrders;
  }

  /**
   * Obtém uma ordem de serviço por ID
   */
  async getById(id: string): Promise<ServiceOrder> {
    const response = await api.get<ServiceOrder>(`/service-orders/${id}`);
    if (!response) {
      throw new Error('Resposta inválida do servidor ao obter ordem de serviço');
    }
    return response;
  }

  /**
   * Lista histórico de ordens de serviço de um cliente
   */
  async getClientHistory(clientId: string): Promise<ServiceOrder[]> {
    const response = await api.get<ServiceOrderListResponse>(
      `/service-orders/client/${clientId}/history`
    );
    if (!response.serviceOrders || !Array.isArray(response.serviceOrders)) {
      throw new Error('Resposta inválida do servidor ao listar histórico de ordens de serviço');
    }
    return response.serviceOrders;
  }

  /**
   * Atualiza o status de uma ordem de serviço (admin)
   */
  async updateStatus(
    id: string,
    status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO'
  ): Promise<ServiceOrder> {
    const response = await api.patch<ServiceOrder>(`/service-orders/${id}/status`, {
      status,
    });
    if (!response) {
      throw new Error('Resposta inválida do servidor ao atualizar status da ordem de serviço');
    }
    return response;
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
    const response = await api.patch<ServiceOrder>(`/service-orders/${id}/materials`, {
      materials,
    });
    if (!response) {
      throw new Error('Resposta inválida do servidor ao adicionar materiais à ordem de serviço');
    }
    return response;
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
    const response = await api.patch<ServiceOrder>(`/service-orders/${id}/costs`, costs);
    if (!response) {
      throw new Error('Resposta inválida do servidor ao atualizar custos da ordem de serviço');
    }
    return response;
  }
}

// Instância única do serviço
export const serviceOrderService = new ServiceOrderService();
