import { ServiceOrderRepository } from '../repositories/ServiceOrderRepository';
import { ClientRepository } from '../repositories/ClientRepository';
import { MachineRepository } from '../repositories/MachineRepository';
import { AppError } from '../config/AppError';
import { IServiceOrder } from '../database/models/serviceOrder.model';
import { FinancialEntryModel } from '../database/models/financialEntry.model';

export class ServiceOrderService {
  private serviceOrderRepository: ServiceOrderRepository;
  private clientRepository: ClientRepository;
  private machineRepository: MachineRepository;

  constructor() {
    this.serviceOrderRepository = new ServiceOrderRepository();
    this.clientRepository = new ClientRepository();
    this.machineRepository = new MachineRepository();
  }

  /**
   * Cria uma nova ordem de serviço
   */
  async create(
    data: Partial<IServiceOrder>,
    userRole: string,
    userId: string
  ) {
    // Valida que cliente existe
    const client = await this.clientRepository.findById(
      data.clientId!.toString()
    );

    if (!client) {
      throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
    }

    // Se usuário é CLIENT, valida que está criando para si mesmo
    if (userRole === 'CLIENT') {
      const userClient = await this.clientRepository.findByUserId(userId);

      if (!userClient || userClient._id.toString() !== data.clientId!.toString()) {
        throw new AppError(
          'Você só pode criar ordens de serviço para si mesmo',
          'FORBIDDEN',
          403
        );
      }

      // Cliente só pode criar com status ORCAMENTO
      data.status = 'ORCAMENTO';
    }

    // Valida que máquina existe e está ativa
    const machine = await this.machineRepository.findById(
      data.machineId!.toString()
    );

    if (!machine) {
      throw new AppError('Máquina não encontrada', 'MACHINE_NOT_FOUND', 404);
    }

    if (!machine.active) {
      throw new AppError('Máquina inativa', 'MACHINE_INACTIVE', 400);
    }

    // Valida que há pelo menos um serviço
    if (!data.services || data.services.length === 0) {
      throw new AppError(
        'Deve haver pelo menos um serviço',
        'NO_SERVICES',
        400
      );
    }

    // Valida dados dos serviços
    data.services.forEach((service, index) => {
      if (!service.description || service.description.trim() === '') {
        throw new AppError(
          `Serviço ${index + 1}: Descrição é obrigatória`,
          'INVALID_SERVICE',
          400
        );
      }

      if (service.estimatedHours < 0) {
        throw new AppError(
          `Serviço ${index + 1}: Horas estimadas não podem ser negativas`,
          'INVALID_SERVICE',
          400
        );
      }

      if (service.price < 0) {
        throw new AppError(
          `Serviço ${index + 1}: Preço não pode ser negativo`,
          'INVALID_SERVICE',
          400
        );
      }
    });

    const servicesTotal = data.services.reduce((total, service) => {
      return total + (service.price || 0);
    }, 0);

    // Define valores padrão
    if (!data.status) {
      data.status = 'ORCAMENTO';
    }

    if (data.laborCost === undefined) {
      data.laborCost = servicesTotal;
    }

    if (data.partsCost === undefined) {
      data.partsCost = 0;
    }

    if (data.totalCost === undefined) {
      data.totalCost = data.laborCost + data.partsCost;
    }

    const createdServiceOrder = await this.serviceOrderRepository.create(data);

    await this.syncFinanceEntry(createdServiceOrder);

    return createdServiceOrder;
  }

  /**
   * Lista todas as ordens de serviço
   */
  async list(userRole: string, userId?: string) {
    // Admin vê todas
    if (userRole === 'ADMIN') {
      return await this.serviceOrderRepository.findAll();
    }

    // Cliente vê apenas suas ordens
    if (userId) {
      const client = await this.clientRepository.findByUserId(userId);

      if (!client) {
        return [];
      }

      return await this.serviceOrderRepository.findByClientId(
        client._id.toString()
      );
    }

    return [];
  }

  /**
   * Busca ordem de serviço por ID
   */
  async getById(id: string, userRole: string, userId?: string) {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new AppError(
        'Ordem de serviço não encontrada',
        'SERVICE_ORDER_NOT_FOUND',
        404
      );
    }

    // Se cliente, valida que ordem pertence a ele
    if (userRole === 'CLIENT' && userId) {
      const client = await this.clientRepository.findByUserId(userId);

      if (
        !client ||
        serviceOrder.clientId.toString() !== client._id.toString()
      ) {
        throw new AppError(
          'Sem permissão para acessar esta ordem de serviço',
          'FORBIDDEN',
          403
        );
      }
    }

    return serviceOrder;
  }

  /**
   * Lista histórico de ordens de serviço de um cliente
   */
  async getClientHistory(clientId: string, userRole: string, userId?: string) {
    // Se cliente, valida que está acessando seu próprio histórico
    if (userRole === 'CLIENT' && userId) {
      const client = await this.clientRepository.findByUserId(userId);

      if (!client || client._id.toString() !== clientId) {
        throw new AppError(
          'Sem permissão para acessar histórico deste cliente',
          'FORBIDDEN',
          403
        );
      }
    }

    return await this.serviceOrderRepository.findByClientId(clientId);
  }

  /**
   * Atualiza status de uma ordem de serviço
   */
  async updateStatus(
    id: string,
    status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO',
    userRole: string
  ) {
    // Apenas admin pode atualizar status
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para atualizar status',
        'FORBIDDEN',
        403
      );
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new AppError(
        'Ordem de serviço não encontrada',
        'SERVICE_ORDER_NOT_FOUND',
        404
      );
    }

    // Valida transição de status
    const validTransitions: Record<string, string[]> = {
      ORCAMENTO: ['APROVADO'],
      APROVADO: ['EM_EXECUCAO'],
      EM_EXECUCAO: ['CONCLUIDO'],
      CONCLUIDO: [],
    };

    if (!validTransitions[serviceOrder.status].includes(status)) {
      throw new AppError(
        `Transição de status inválida: ${serviceOrder.status} → ${status}`,
        'INVALID_STATUS_TRANSITION',
        400
      );
    }

    // Se mudando para CONCLUIDO, valida custos
    if (status === 'CONCLUIDO') {
      if (
        serviceOrder.laborCost < 0 ||
        serviceOrder.partsCost < 0 ||
        serviceOrder.totalCost < 0
      ) {
        throw new AppError(
          'Custos não podem ser negativos',
          'INVALID_COSTS',
          400
        );
      }
    }

    const updatedServiceOrder = await this.serviceOrderRepository.updateStatus(id, status);

    if (updatedServiceOrder && status === 'APROVADO') {
      await this.syncFinanceEntry(updatedServiceOrder);
    }

    return updatedServiceOrder;
  }

  /**
   * Adiciona materiais a uma ordem de serviço
   */
  async addMaterials(
    id: string,
    materials: Array<{
      inventoryItemId: string;
      quantity: number;
      unitCost: number;
    }>,
    userRole: string
  ) {
    // Apenas admin pode adicionar materiais
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para adicionar materiais',
        'FORBIDDEN',
        403
      );
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new AppError(
        'Ordem de serviço não encontrada',
        'SERVICE_ORDER_NOT_FOUND',
        404
      );
    }

    // Valida dados dos materiais
    materials.forEach((material, index) => {
      if (material.quantity <= 0) {
        throw new AppError(
          `Material ${index + 1}: Quantidade deve ser maior que zero`,
          'INVALID_MATERIAL',
          400
        );
      }

      if (material.unitCost < 0) {
        throw new AppError(
          `Material ${index + 1}: Custo não pode ser negativo`,
          'INVALID_MATERIAL',
          400
        );
      }
    });

    return await this.serviceOrderRepository.addMaterials(id, materials);
  }

  /**
   * Atualiza custos de uma ordem de serviço
   */
  async updateCosts(
    id: string,
    laborCost: number,
    partsCost: number,
    totalCost: number,
    userRole: string
  ) {
    // Apenas admin pode atualizar custos
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para atualizar custos',
        'FORBIDDEN',
        403
      );
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new AppError(
        'Ordem de serviço não encontrada',
        'SERVICE_ORDER_NOT_FOUND',
        404
      );
    }

    // Valida custos
    if (laborCost < 0 || partsCost < 0 || totalCost < 0) {
      throw new AppError(
        'Custos não podem ser negativos',
        'INVALID_COSTS',
        400
      );
    }

    const updatedServiceOrder = await this.serviceOrderRepository.updateCosts(
      id,
      laborCost,
      partsCost,
      totalCost
    );

    if (updatedServiceOrder && updatedServiceOrder.status !== 'ORCAMENTO') {
      await this.syncFinanceEntry(updatedServiceOrder);
    }

    return updatedServiceOrder;
  }

  private async syncFinanceEntry(serviceOrder: IServiceOrder) {
    const amount = Math.max(serviceOrder.totalCost || 0, 0);
    const orderNumber = serviceOrder.sequence
      ? String(serviceOrder.sequence).padStart(3, '0')
      : serviceOrder._id.toString().slice(-6);

    await FinancialEntryModel.findOneAndUpdate(
      {
        serviceOrderId: serviceOrder._id,
        type: 'INCOME',
      },
      {
        serviceOrderId: serviceOrder._id,
        type: 'INCOME',
        description: `OS ${orderNumber}`,
        amount,
        date: serviceOrder.updatedAt || new Date(),
        category: 'ORDEM_SERVICO',
      },
      { upsert: true, new: true, runValidators: true }
    );
  }
}
