import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import * as ClientsService from './clients.service';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('ADMIN'), async (_req: Request, res: Response, next) => {
  try {
    const clients = await ClientsService.findAll();
    res.json(clients);
  } catch (err) { next(err); }
});

router.get('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    const client = await ClientsService.findById(req.params.id);
    res.json(client);
  } catch (err) { next(err); }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    const client = await ClientsService.create(req.body);
    res.status(201).json(client);
  } catch (err) { next(err); }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    const client = await ClientsService.update(req.params.id, req.body);
    res.json(client);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    await ClientsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
