import { MachineRepository } from '../repositories/MachineRepository';
import { ClientRepository } from '../repositories/ClientRepository';
import { AppError } from '../config/AppError';
import { IMachine } from '../database/models/Machine.model';

export class MachineService {
  private machineRepository: MachineRepository;
  private clientRepository: ClientRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.clientRepository = new ClientRepository();
  }

  /**
   * Cria uma nova máquina
   */
  async create(data: Partial<IMachine>, userRole: string) {
    // Apenas admin pode criar máquinas
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para criar máquinas',
        'FORBIDDEN',
        403
      );
    }

    // Se clientId fornecido, valida que cliente existe
    if (data.clientId) {
      const clientExists = await this.clientRepository.exists(
        data.clientId.toString()
      );

      if (!clientExists) {
        throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
      }
    }

    // Se número de série fornecido, valida que não existe
    if (data.serialNumber) {
      const existingMachine = await this.machineRepository.findBySerialNumber(
        data.serialNumber
      );

      if (existingMachine) {
        throw new AppError(
          'Número de série já cadastrado',
          'SERIAL_NUMBER_EXISTS',
          409
        );
      }
    }

    return await this.machineRepository.create(data);
  }

  /**
   * Lista todas as máquinas
   */
  async list(userRole: string, userId?: string) {
    // Admin vê todas
    if (userRole === 'ADMIN') {
      return await this.machineRepository.findAll();
    }

    // Cliente vê apenas suas máquinas
    if (userId) {
      const client = await this.clientRepository.findByUserId(userId);

      if (!client) {
        return [];
      }

      return await this.machineRepository.findByClientId(
        client._id.toString()
      );
    }

    return [];
  }

  /**
   * Busca máquina por ID
   */
  async getById(id: string, userRole: string, userId?: string) {
    const machine = await this.machineRepository.findById(id);

    if (!machine) {
      throw new AppError('Máquina não encontrada', 'MACHINE_NOT_FOUND', 404);
    }

    // Se cliente, valida que máquina pertence a ele
    if (userRole === 'CLIENT' && userId) {
      const client = await this.clientRepository.findByUserId(userId);

      if (!client || machine.clientId?.toString() !== client._id.toString()) {
        throw new AppError('Sem permissão para acessar esta máquina', 'FORBIDDEN', 403);
      }
    }

    return machine;
  }

  /**
   * Atualiza uma máquina
   */
  async update(id: string, data: Partial<IMachine>, userRole: string) {
    // Apenas admin pode atualizar máquinas
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para atualizar máquinas',
        'FORBIDDEN',
        403
      );
    }

    // Valida que máquina existe
    const machine = await this.machineRepository.findById(id);

    if (!machine) {
      throw new AppError('Máquina não encontrada', 'MACHINE_NOT_FOUND', 404);
    }

    // Se mudando clientId, valida que cliente existe
    if (data.clientId && data.clientId.toString() !== machine.clientId?.toString()) {
      const clientExists = await this.clientRepository.exists(
        data.clientId.toString()
      );

      if (!clientExists) {
        throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
      }
    }

    // Se mudando número de série, valida que não existe
    if (data.serialNumber && data.serialNumber !== machine.serialNumber) {
      const existingMachine = await this.machineRepository.findBySerialNumber(
        data.serialNumber
      );

      if (existingMachine) {
        throw new AppError(
          'Número de série já cadastrado',
          'SERIAL_NUMBER_EXISTS',
          409
        );
      }
    }

    return await this.machineRepository.update(id, data);
  }

  /**
   * Remove uma máquina (soft delete)
   */
  async delete(id: string, userRole: string) {
    // Apenas admin pode deletar máquinas
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para deletar máquinas',
        'FORBIDDEN',
        403
      );
    }

    const machine = await this.machineRepository.findById(id);

    if (!machine) {
      throw new AppError('Máquina não encontrada', 'MACHINE_NOT_FOUND', 404);
    }

    return await this.machineRepository.delete(id);
  }

  /**
   * Lista máquinas ativas (para seleção em formulários)
   */
  async listActive() {
    return await this.machineRepository.findActive();
  }
}
