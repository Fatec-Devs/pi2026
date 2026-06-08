import { Machine, IMachine } from '../database/models/machine.model';
import mongoose from 'mongoose';

export class MachineRepository {
  /**
   * Cria uma nova máquina
   */
  async create(data: Partial<IMachine>): Promise<IMachine> {
    const machine = new Machine(data);
    return await machine.save();
  }

  /**
   * Busca máquina por ID
   */
  async findById(id: string): Promise<IMachine | null> {
    return await Machine.findById(id).populate('clientId');
  }

  /**
   * Lista todas as máquinas
   */
  async findAll(): Promise<IMachine[]> {
    return await Machine.find().populate('clientId');
  }

  /**
   * Lista máquinas ativas
   */
  async findActive(): Promise<IMachine[]> {
    return await Machine.find({ active: true }).populate('clientId');
  }

  /**
   * Lista máquinas por cliente
   */
  async findByClientId(clientId: string): Promise<IMachine[]> {
    return await Machine.find({
      clientId: new mongoose.Types.ObjectId(clientId),
    }).populate('clientId');
  }

  /**
   * Busca máquina por número de série
   */
  async findBySerialNumber(serialNumber: string): Promise<IMachine | null> {
    return await Machine.findOne({ serialNumber }).populate('clientId');
  }

  /**
   * Atualiza uma máquina
   */
  async update(id: string, data: Partial<IMachine>): Promise<IMachine | null> {
    return await Machine.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('clientId');
  }

  /**
   * Remove uma máquina (soft delete)
   */
  async delete(id: string): Promise<IMachine | null> {
    return await Machine.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
  }

  /**
   * Remove permanentemente uma máquina
   */
  async hardDelete(id: string): Promise<IMachine | null> {
    return await Machine.findByIdAndDelete(id);
  }

  /**
   * Verifica se uma máquina existe e está ativa
   */
  async existsAndActive(id: string): Promise<boolean> {
    const count = await Machine.countDocuments({ _id: id, active: true });
    return count > 0;
  }
}
