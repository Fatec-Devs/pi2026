import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/login
   */
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Email e senha são obrigatórios',
      });
    }

    const result = await this.authService.login(email, password);

    return res.status(200).json(result);
  };

  /**
   * POST /auth/register-client
   */
  registerClient = async (req: Request, res: Response) => {
    const { name, email, password, phone, document, address } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        code: 'MISSING_FIELDS',
        message: 'Nome, email e senha são obrigatórios',
      });
    }

    const result = await this.authService.registerClient({
      name,
      email,
      password,
      phone,
      document,
      address,
    });

    return res.status(201).json(result);
  };

  /**
   * GET /auth/me
   */
  getMe = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Não autenticado',
      });
    }

    const user = await this.authService.getMe(userId);

    return res.status(200).json(user);
  };
}
