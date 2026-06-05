import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import * as InventoryService from './inventory.service';

const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));

router.get('/', async (_req: Request, res: Response, next) => {
  try {
    const items = await InventoryService.findAll();
    res.json(items);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const item = await InventoryService.findById(req.params.id);
    res.json(item);
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next) => {
  try {
    const item = await InventoryService.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const item = await InventoryService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.patch('/:id/adjust', async (req: Request, res: Response, next) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryService.adjustStock(req.params.id, Number(quantity));
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    await InventoryService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
