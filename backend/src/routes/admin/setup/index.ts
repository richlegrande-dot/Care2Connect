import { Router } from 'express';
import connectivityRoutes from './connectivity';
import tunnelRoutes from './tunnel';

const router = Router();

// Mount sub-routes
router.use('/connectivity', connectivityRoutes);
router.use('/tunnel/cloudflare', tunnelRoutes);

export default router;
