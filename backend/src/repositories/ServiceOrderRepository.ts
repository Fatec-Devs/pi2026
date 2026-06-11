import { ServiceOrder, IServiceOrder } from '../database/models/serviceOrder.model';
import mongoose from 'mongoose';

export class ServiceOrderRepository {
  /**
   * Cria uma nova ordem de serviço
   */
  async create(data: Partial<IServiceOrder>): Promise<IServiceOrder> {
    const lastSequenceOrder = await ServiceOrder.findOne({ sequence: { $exists: true } })
      .sort({ sequence: -1 })
      .select('sequence');

    const nextSequence = (lastSequenceOrder?.sequence ?? 0) + 1;

    const serviceOrder = new ServiceOrder({
      ...data,
      sequence: nextSequence,
    });
    return await serviceOrder.save();
  }

  /**
   * Busca ordem de serviço por ID
   */
  async findById(id: string): Promise<IServiceOrder | null> {
    return await ServiceOrder.findById(id)
      .populate('clientId')
      .populate('machineId');
  }

  /**
   * Lista todas as ordens de serviço
   */
  async findAll(): Promise<IServiceOrder[]> {
    return await ServiceOrder.find()
      .populate('clientId')
      .populate('machineId')
      .sort({ createdAt: -1 });
  }

  /**
   * Lista ordens de serviço por cliente
   */
  async findByClientId(clientId: string): Promise<IServiceOrder[]> {
    return await ServiceOrder.find({
      clientId: new mongoose.Types.ObjectId(clientId),
    })
      .populate('clientId')
      .populate('machineId')
      .sort({ createdAt: -1 });
  }

  /**
   * Lista ordens de serviço por máquina
   */
  async findByMachineId(machineId: string): Promise<IServiceOrder[]> {
    return await ServiceOrder.find({
      machineId: new mongoose.Types.ObjectId(machineId),
    })
      .populate('clientId')
      .populate('machineId')
      .sort({ createdAt: -1 });
  }

  /**
   * Lista ordens de serviço por status
   */
  async findByStatus(
    status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO'
  ): Promise<IServiceOrder[]> {
    return await ServiceOrder.find({ status })
      .populate('clientId')
      .populate('machineId')
      .sort({ createdAt: -1 });
  }

  /**
   * Atualiza uma ordem de serviço
   */
  async update(
    id: string,
    data: Partial<IServiceOrder>
  ): Promise<IServiceOrder | null> {
    return await ServiceOrder.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('clientId')
      .populate('machineId');
  }

  /**
   * Atualiza status de uma ordem de serviço
   */
  async updateStatus(
    id: string,
    status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO'
  ): Promise<IServiceOrder | null> {
    const update: any = { status };

    // Define timestamps de acordo com o status
    if (status === 'APROVADO') {
      update.approvedAt = new Date();
    } else if (status === 'EM_EXECUCAO') {
      update.startedAt = new Date();
    } else if (status === 'CONCLUIDO') {
      update.finishedAt = new Date();
    }

    return await ServiceOrder.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate('clientId')
      .populate('machineId');
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
    }>
  ): Promise<IServiceOrder | null> {
    return await ServiceOrder.findByIdAndUpdate(
      id,
      { $push: { materials: { $each: materials } } },
      { new: true, runValidators: true }
    )
      .populate('clientId')
      .populate('machineId');
  }

  /**
   * Atualiza custos de uma ordem de serviço
   */
  async updateCosts(
    id: string,
    laborCost: number,
    partsCost: number,
    totalCost: number
  ): Promise<IServiceOrder | null> {
    return await ServiceOrder.findByIdAndUpdate(
      id,
      { laborCost, partsCost, totalCost },
      { new: true, runValidators: true }
    )
      .populate('clientId')
      .populate('machineId');
  }

  /**
   * Remove uma ordem de serviço
   */
  async delete(id: string): Promise<IServiceOrder | null> {
    return await ServiceOrder.findByIdAndDelete(id);
  }

  /**
   * Conta ordens de serviço por status
   */
  async countByStatus(): Promise<Record<string, number>> {
    const result = await ServiceOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {
      ORCAMENTO: 0,
      APROVADO: 0,
      EM_EXECUCAO: 0,
      CONCLUIDO: 0,
    };

    result.forEach((item) => {
      counts[item._id] = item.count;
    });

    return counts;
  }
}
