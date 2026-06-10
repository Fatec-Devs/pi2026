import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  /**
   * GET /clients/me
   * Retorna o cliente do usuário autenticado
   */
  getMe = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const client = await this.clientService.getMe(userId!, userRole!);

    // Se não houver cliente (ex: admin sem cliente associado), retorna 404
    if (!client) {
      return res.status(404).json({
        code: 'CLIENT_NOT_FOUND',
        message: 'Cliente não encontrado para este usuário',
      });
    }

    return res.status(200).json(client);
  };

  /**
   * GET /clients
   * Lista todos os clientes (só ADMIN)
   */
  list = async (req: Request, res: Response) => {
    const userRole = req.user?.role;

    const clients = await this.clientService.list(userRole!);

    return res.status(200).json({
      clients,
      total: clients.length,
    });
  };

  /**
   * GET /clients/:id
   */
  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    const client = await this.clientService.getById(id, userRole!);

    return res.status(200).json(client);
  };

  /**
   * POST /clients
   */
  create = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const { userId, document, address, notes } = req.body;

    const client = await this.clientService.create(
      {
        userId,
        document,
        address,
        notes,
      },
      userRole!
    );

    return res.status(201).json(client);
  };

  /**
   * PUT /clients/:id
   */
  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const { document, address, notes } = req.body;

    const client = await this.clientService.update(
      id,
      {
        document,
        address,
        notes,
      },
      userRole!
    );

    return res.status(200).json(client);
  };

  /**
   * DELETE /clients/:id
   */
  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    await this.clientService.delete(id, userRole!);

    return res.status(200).json({
      message: 'Cliente removido com sucesso',
    });
  };
}
