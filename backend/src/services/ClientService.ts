import { ClientRepository } from '../repositories/ClientRepository';
import { AppError } from '../config/AppError';
import { IClient } from '../database/models/client.model';

export class ClientService {
  private clientRepository: ClientRepository;

  constructor() {
    this.clientRepository = new ClientRepository();
  }

  /**
   * Busca o cliente do usuário autenticado
   */
  async getMe(userId: string, userRole: string) {
    // Apenas clientes e admins podem acessar
    if (userRole !== 'CLIENT' && userRole !== 'ADMIN') {
      throw new AppError(
        'Apenas clientes e admins podem acessar dados de cliente',
        'FORBIDDEN',
        403
      );
    }

    // Busca o cliente pelo userId
    const client = await this.clientRepository.findByUserId(userId);

    // Retorna o cliente se existir, ou null (sem erro)
    // O controller decide como tratar o caso de não existir
    return client;
  }

  /**
   * Busca cliente por ID
   */
  async getById(id: string, userRole: string) {
    // Apenas admin pode buscar clientes por ID
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para buscar clientes',
        'FORBIDDEN',
        403
      );
    }

    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
    }

    return client;
  }

  /**
   * Lista todos os clientes
   */
  async list(userRole: string) {
    // Apenas admin pode listar todos os clientes
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para listar clientes',
        'FORBIDDEN',
        403
      );
    }

    return await this.clientRepository.findAll();
  }

  /**
   * Cria um novo cliente
   */
  async create(data: Partial<IClient>, userRole: string) {
    // Apenas admin pode criar clientes
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para criar clientes',
        'FORBIDDEN',
        403
      );
    }

    // Se userId fornecido, valida que já não existe cliente para este usuário
    if (data.userId) {
      const existingClient = await this.clientRepository.findByUserId(
        data.userId.toString()
      );

      if (existingClient) {
        throw new AppError(
          'Já existe um cliente para este usuário',
          'CLIENT_ALREADY_EXISTS',
          409
        );
      }
    }

    // Se documento fornecido, valida que não existe
    if (data.document) {
      const existingClient = await this.clientRepository.findByDocument(
        data.document
      );

      if (existingClient) {
        throw new AppError(
          'Documento já cadastrado',
          'DOCUMENT_ALREADY_EXISTS',
          409
        );
      }
    }

    return await this.clientRepository.create(data);
  }

  /**
   * Atualiza um cliente
   */
  async update(id: string, data: Partial<IClient>, userRole: string) {
    // Apenas admin pode atualizar clientes
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para atualizar clientes',
        'FORBIDDEN',
        403
      );
    }

    // Valida que cliente existe
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
    }

    // Se mudando documento, valida que não existe
    if (data.document && data.document !== client.document) {
      const existingClient = await this.clientRepository.findByDocument(
        data.document
      );

      if (existingClient) {
        throw new AppError(
          'Documento já cadastrado',
          'DOCUMENT_ALREADY_EXISTS',
          409
        );
      }
    }

    return await this.clientRepository.update(id, data);
  }

  /**
   * Remove um cliente
   */
  async delete(id: string, userRole: string) {
    // Apenas admin pode deletar clientes
    if (userRole !== 'ADMIN') {
      throw new AppError(
        'Sem permissão para deletar clientes',
        'FORBIDDEN',
        403
      );
    }

    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
    }

    return await this.clientRepository.delete(id);
  }
}
