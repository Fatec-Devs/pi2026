import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET /machines
 * Lista todas as máquinas
 */
router.get('/', async (req: Request, res: Response, next) => {
  try {
    // TODO: MachineService.findAll()
    res.json({ message: 'GET /machines - a implementar' });
  } catch (err) { next(err); }
});

/**
 * GET /machines/:id
 */
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    // TODO: MachineService.findById(req.params.id)
    res.json({ message: `GET /machines/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

/**
 * POST /machines
 * Body: { name, brand, model, serialNumber, location, status }
 */
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: MachineService.create(req.body)
    res.status(201).json({ message: 'POST /machines - a implementar' });
  } catch (err) { next(err); }
});

/**
 * PUT /machines/:id
 * Body: campos a atualizar
 */
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: MachineService.update(req.params.id, req.body)
    res.json({ message: `PUT /machines/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

/**
 * DELETE /machines/:id
 */
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    // TODO: MachineService.delete(req.params.id)
    res.json({ message: `DELETE /machines/${req.params.id} - a implementar` });
  } catch (err) { next(err); }
});

export default router;
