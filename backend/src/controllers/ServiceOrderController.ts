import { Request, Response } from 'express';
import { ServiceOrderService } from '../services/ServiceOrderService';

export class ServiceOrderController {
  private serviceOrderService: ServiceOrderService;

  constructor() {
    this.serviceOrderService = new ServiceOrderService();
  }

  /**
   * GET /service-orders
   */
  list = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const serviceOrders = await this.serviceOrderService.list(
      userRole!,
      userId
    );

    return res.status(200).json({
      serviceOrders,
      total: serviceOrders.length,
    });
  };

  /**
   * GET /service-orders/:id
   */
  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const serviceOrder = await this.serviceOrderService.getById(
      id,
      userRole!,
      userId
    );

    return res.status(200).json(serviceOrder);
  };

  /**
   * GET /service-orders/client/:clientId/history
   */
  getClientHistory = async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const serviceOrders = await this.serviceOrderService.getClientHistory(
      clientId,
      userRole!,
      userId
    );

    return res.status(200).json({
      serviceOrders,
      total: serviceOrders.length,
    });
  };

  /**
   * POST /service-orders
   */
  create = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    const { clientId, machineId, services, notes } = req.body;

    // Validação básica
    if (!clientId || !machineId || !services || services.length === 0) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Cliente, máquina e serviços são obrigatórios',
      });
    }

    const serviceOrder = await this.serviceOrderService.create(
      {
        clientId,
        machineId,
        services,
        notes,
      },
      userRole!,
      userId!
    );

    return res.status(201).json({
      serviceOrder,
      message: 'Ordem de serviço criada com sucesso',
    });
  };

  /**
   * PATCH /service-orders/:id/status
   */
  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user?.role;

    // Validação básica
    if (!status) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Status é obrigatório',
      });
    }

    const validStatuses = ['ORCAMENTO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 'INVALID_STATUS',
        message: 'Status inválido',
      });
    }

    const serviceOrder = await this.serviceOrderService.updateStatus(
      id,
      status,
      userRole!
    );

    return res.status(200).json(serviceOrder);
  };

  /**
   * PATCH /service-orders/:id/materials
   */
  addMaterials = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { materials } = req.body;
    const userRole = req.user?.role;

    // Validação básica
    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({
        code: 'INVALID_MATERIALS',
        message: 'Materiais devem ser um array',
      });
    }

    const serviceOrder = await this.serviceOrderService.addMaterials(
      id,
      materials,
      userRole!
    );

    return res.status(200).json(serviceOrder);
  };

  /**
   * PATCH /service-orders/:id/costs
   */
  updateCosts = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { laborCost, partsCost, totalCost } = req.body;
    const userRole = req.user?.role;

    // Validação básica
    if (
      laborCost === undefined ||
      partsCost === undefined ||
      totalCost === undefined
    ) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Todos os custos são obrigatórios',
      });
    }

    const serviceOrder = await this.serviceOrderService.updateCosts(
      id,
      laborCost,
      partsCost,
      totalCost,
      userRole!
    );

    return res.status(200).json(serviceOrder);
  };
}
