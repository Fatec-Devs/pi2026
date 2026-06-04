import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { ServiceOrderController } from '../../controllers/ServiceOrderController';

const router = Router();
const serviceOrderController = new ServiceOrderController();

router.use(authMiddleware);

// GET /service-orders
router.get('/', async (req, res, next) => {
  try {
    await serviceOrderController.list(req, res);
  } catch (err) { 
    next(err); 
  }
});

// GET /service-orders/client/:clientId/history
router.get('/client/:clientId/history', async (req, res, next) => {
  try {
    await serviceOrderController.getClientHistory(req, res);
  } catch (err) { 
    next(err); 
  }
});

// GET /service-orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    await serviceOrderController.getById(req, res);
  } catch (err) { 
    next(err); 
  }
});

// POST /service-orders
// Permitir tanto ADMIN quanto CLIENT (CLIENT só pode criar para si mesmo)
router.post('/', async (req, res, next) => {
  try {
    await serviceOrderController.create(req, res);
  } catch (err) { 
    next(err); 
  }
});

// PATCH /service-orders/:id/status
router.patch('/:id/status', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await serviceOrderController.updateStatus(req, res);
  } catch (err) { 
    next(err); 
  }
});

// PATCH /service-orders/:id/materials
router.patch('/:id/materials', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await serviceOrderController.addMaterials(req, res);
  } catch (err) { 
    next(err); 
  }
});

// PATCH /service-orders/:id/costs
router.patch('/:id/costs', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await serviceOrderController.updateCosts(req, res);
  } catch (err) { 
    next(err); 
  }
});

export default router;
