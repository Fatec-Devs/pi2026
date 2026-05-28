import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET /clients
 * Lista todos os clientes (só ADMIN)
 */
router.get('/', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: ClientService.findAll()
    res.json({ message: 'GET /clients - a implementar' });
  } catch (err) { next(err); }
});

/**
 * GET /clients/:id
 */
router.get('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: ClientService.findById(req.params.id)
    res.json({ message: `GET /clients/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

/**
 * POST /clients
 * Body: { userId, document, address, notes }
 */
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: ClientService.create(req.body)
    res.status(201).json({ message: 'POST /clients - a implementar' });
  } catch (err) { next(err); }
});

/**
 * PUT /clients/:id
 * Body: campos a atualizar
 */
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: ClientService.update(req.params.id, req.body)
    res.json({ message: `PUT /clients/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

/**
 * DELETE /clients/:id
 */
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: ClientService.delete(req.params.id)
    res.json({ message: `DELETE /clients/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

export default router;
