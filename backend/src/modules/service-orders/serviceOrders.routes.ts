import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

// GET /service-orders
router.get('/', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: 'GET /service-orders - a implementar' });
  } catch (err) { next(err); }
});

// GET /service-orders/client/:clientId/history
router.get('/client/:clientId/history', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `GET histórico cliente ${req.params.clientId} - a implementar` });
  } catch (err) { next(err); }
});

// GET /service-orders/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `GET /service-orders/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

// POST /service-orders
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    res.status(201).json({ message: 'POST /service-orders - a implementar' });
  } catch (err) { next(err); }
});

// PATCH /service-orders/:id/status
router.patch('/:id/status', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `PATCH status OS ${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

// PATCH /service-orders/:id/materials
router.patch('/:id/materials', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `PATCH materials OS ${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

// PATCH /service-orders/:id/costs
router.patch('/:id/costs', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    res.json({ message: `PATCH costs OS ${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

export default router;
