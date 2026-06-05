import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as AuthService from './auth.service';

const router = Router();

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err) { next(err); }
});

/**
 * POST /auth/register-client
 * Body: { name, email, password, phone, document, address }
 */
router.post('/register-client', async (req: Request, res: Response, next) => {
  try {
    // TODO: AuthService.registerClient(req.body)
    res.status(201).json({ message: 'register-client - a implementar' });
  } catch (err) { next(err); }
});

/**
 * GET /auth/me
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next) => {
  try {
    const result = await AuthService.me(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
