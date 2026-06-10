import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { MachineController } from '../../controllers/MachineController';

const router = Router();
const machineController = new MachineController();

router.use(authMiddleware);

/**
 * GET /machines
 * Lista todas as máquinas
 */
router.get('/', async (req, res, next) => {
  try {
    await machineController.list(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * GET /machines/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    await machineController.getById(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * POST /machines
 * Body: { name, brand, model, serialNumber, location, status }
 */
router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await machineController.create(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * PUT /machines/:id
 * Body: campos a atualizar
 */
router.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await machineController.update(req, res);
  } catch (err) { 
    next(err); 
  }
});

/**
 * DELETE /machines/:id
 */
router.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await machineController.delete(req, res);
  } catch (err) { 
    next(err); 
  }
});

export default router;
