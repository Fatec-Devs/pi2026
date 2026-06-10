import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { ClientController } from '../../controllers/ClientController';

const router = Router();
const clientController = new ClientController();

router.use(authMiddleware);

/**
 * GET /clients/me
 * Retorna o cliente do usuário autenticado
 */
router.get('/me', clientController.getMe);

/**
 * GET /clients
 * Lista todos os clientes (só ADMIN)
 */
router.get('/', requireRole('ADMIN'), clientController.list);

/**
 * GET /clients/:id
 */
router.get('/:id', requireRole('ADMIN'), clientController.getById);

/**
 * POST /clients
 * Body: { userId, document, address, notes }
 */
router.post('/', requireRole('ADMIN'), clientController.create);

/**
 * PUT /clients/:id
 * Body: campos a atualizar
 */
router.put('/:id', requireRole('ADMIN'), clientController.update);

/**
 * DELETE /clients/:id
 */
router.delete('/:id', requireRole('ADMIN'), clientController.delete);

export default router;
