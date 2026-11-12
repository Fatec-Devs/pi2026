import { Client, IClient } from '../database/models/Client.model';
import mongoose from 'mongoose';

export class ClientRepository {
  /**
   * Cria um novo cliente
   */
  async create(data: Partial<IClient>): Promise<IClient> {
    const client = new Client(data);
    return await client.save();
  }

  /**
   * Busca cliente por ID
   */
  async findById(id: string): Promise<IClient | null> {
    return await Client.findById(id).populate('userId');
  }

  /**
   * Busca cliente por userId
   */
  async findByUserId(userId: string): Promise<IClient | null> {
    return await Client.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).populate('userId');
  }

  /**
   * Busca cliente por documento
   */
  async findByDocument(document: string): Promise<IClient | null> {
    return await Client.findOne({ document });
  }

  /**
   * Lista todos os clientes
   */
  async findAll(): Promise<IClient[]> {
    return await Client.find().populate('userId');
  }

  /**
   * Atualiza um cliente
   */
  async update(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return await Client.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('userId');
  }

  /**
   * Remove um cliente
   */
  async delete(id: string): Promise<IClient | null> {
    return await Client.findByIdAndDelete(id);
  }

  /**
   * Verifica se um cliente existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await Client.countDocuments({ _id: id });
    return count > 0;
  }
}
