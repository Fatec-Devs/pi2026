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
  status?: string;
}

export interface UpdateMachineRequest {
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status?: string;
  active?: boolean;
}

export interface MachineListResponse {
  machines: Machine[];
  total: number;
}

// Serviço de Máquinas
class MachineService {
  /**
   * Lista todas as máquinas
   */
  async list(): Promise<Machine[]> {
    const response = await api.get<MachineListResponse>('/machines');
    return response.machines;
  }

  /**
   * Obtém uma máquina por ID
   */
  async getById(id: string): Promise<Machine> {
    return await api.get<Machine>(`/machines/${id}`);
  }

  /**
   * Cria uma nova máquina (admin)
   */
  async create(data: CreateMachineRequest): Promise<Machine> {
    return await api.post<Machine>('/machines', data);
  }

  /**
   * Atualiza uma máquina (admin)
   */
  async update(id: string, data: UpdateMachineRequest): Promise<Machine> {
    return await api.put<Machine>(`/machines/${id}`, data);
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
