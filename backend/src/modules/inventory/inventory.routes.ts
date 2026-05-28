import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));

// GET /inventory
router.get('/', async (_req: Request, res: Response, next) => {
  try {
    res.json({ message: 'GET /inventory - a implementar' });
  } catch (err) { next(err); }
});

// POST /inventory
router.post('/', async (req: Request, res: Response, next) => {
  try {
    res.status(201).json({ message: 'POST /inventory - a implementar' });
  } catch (err) { next(err); }
});

// PUT /inventory/:id
router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `PUT /inventory/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

// PATCH /inventory/:id/adjust
router.patch('/:id/adjust', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `PATCH ajuste estoque ${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

export default router;
