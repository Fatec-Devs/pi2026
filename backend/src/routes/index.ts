import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import clientsRoutes from '../modules/clients/clients.routes';
import machinesRoutes from '../modules/machines/machines.routes';
import serviceOrdersRoutes from '../modules/service-orders/serviceOrders.routes';
import inventoryRoutes from '../modules/inventory/inventory.routes';
import financeRoutes from '../modules/finance/finance.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientsRoutes);
router.use('/machines', machinesRoutes);
router.use('/service-orders', serviceOrdersRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finance', financeRoutes);

export default router;
