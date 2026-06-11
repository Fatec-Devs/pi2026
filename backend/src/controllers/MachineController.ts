import { Request, Response } from 'express';
import { MachineService } from '../services/MachineService';

export class MachineController {
  private machineService: MachineService;

  constructor() {
    this.machineService = new MachineService();
  }

  /**
   * GET /machines
   */
  list = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const machines = await this.machineService.list(userRole!, userId);

    return res.status(200).json({
      machines,
      total: machines.length,
    });
  };

  /**
   * GET /machines/:id
   */
  getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const machine = await this.machineService.getById(id, userRole!, userId);

    return res.status(200).json(machine);
  };

  /**
   * POST /machines
   */
  create = async (req: Request, res: Response) => {
    const userRole = req.user?.role;
    const { clientId, name, brand, model, serialNumber, location, notes, status } =
      req.body;

    // Validação básica
    if (!name) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Nome é obrigatório',
      });
    }

    const machine = await this.machineService.create(
      {
        clientId,
        name,
        brand,
        model,
        serialNumber,
        location,
        notes,
        status,
      },
      userRole!
    );

    return res.status(201).json(machine);
  };

  /**
   * PUT /machines/:id
   */
  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const { clientId, name, brand, model, serialNumber, location, notes, status, active } =
      req.body;

    const machine = await this.machineService.update(
      id,
      {
        clientId,
        name,
        brand,
        model,
        serialNumber,
        location,
        notes,
        status,
        active,
      },
      userRole!
    );

    return res.status(200).json(machine);
  };

  /**
   * DELETE /machines/:id
   */
  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    await this.machineService.delete(id, userRole!);

    return res.status(200).json({
      message: 'Máquina removida com sucesso',
    });
  };
}
