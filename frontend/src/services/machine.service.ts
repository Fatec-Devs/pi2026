import { api } from './api';
import { Machine } from '../types/domain';

// DTOs para Machines
export interface CreateMachineRequest {
  clientId?: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
  status?: string;
}

export interface UpdateMachineRequest {
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
  status?: string;
  active?: boolean;
}

// Serviço de Máquinas
class MachineService {
  /**
   * Lista todas as máquinas
   */
  async list(): Promise<Machine[]> {
    const response = await api.get<{ machines: Machine[]; total: number }>('/machines');
    if (!response.machines || !Array.isArray(response.machines)) {
      throw new Error('Resposta inválida do servidor ao listar máquinas');
    }
    return response.machines;
  }

  /**
   * Obtém uma máquina por ID
   */
  async getById(id: string): Promise<Machine> {
    const response = await api.get<Machine>(`/machines/${id}`);
    if (!response) {
      throw new Error('Resposta inválida do servidor ao obter máquina');
    }
    return response;
  }

  /**
   * Cria uma nova máquina (admin)
   */
  async create(data: CreateMachineRequest): Promise<Machine> {
    const response = await api.post<Machine>('/machines', data);
    if (!response) {
      throw new Error('Resposta inválida do servidor ao criar máquina');
    }
    return response;
  }

  /**
   * Atualiza uma máquina (admin)
   */
  async update(id: string, data: UpdateMachineRequest): Promise<Machine> {
    const response = await api.put<Machine>(`/machines/${id}`, data);
    if (!response) {
      throw new Error('Resposta inválida do servidor ao atualizar máquina');
    }
    return response;
  }

  /**
   * Remove uma máquina (admin)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/machines/${id}`);
  }

  /**
   * Lista máquinas ativas (disponíveis para ordens de serviço)
   */
  async listActive(): Promise<Machine[]> {
    const machines = await this.list();
    return machines.filter((machine) => machine.active);
  }
}

// Instância única do serviço
export const machineService = new MachineService();
