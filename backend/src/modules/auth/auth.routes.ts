import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { AuthController } from '../../controllers/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    await authController.login(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * POST /auth/register-client
 * Body: { name, email, password, phone, document, address }
 */
router.post('/register-client', async (req, res, next) => {
  try {
    await authController.registerClient(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * GET /auth/me
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await authController.getMe(req, res);
  } catch (err) { 
    next(err); 
  }
});

export default router;
