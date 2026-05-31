import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));

// GET /finance/summary
router.get('/summary', async (_req: Request, res: Response, next) => {
  try {
    res.json({ message: 'GET /finance/summary - a implementar' });
  } catch (err) { next(err); }
});

// GET /finance/entries
router.get('/entries', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: 'GET /finance/entries - a implementar' });
  } catch (err) { next(err); }
});

// POST /finance/entries
router.post('/entries', async (req: Request, res: Response, next) => {
  try {
    res.status(201).json({ message: 'POST /finance/entries - a implementar' });
  } catch (err) { next(err); }
});

export default router;
