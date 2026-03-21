import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Unified Endpoint
router.post('/insights', aiController.getInsights);
router.post('/seed', aiController.seedData);

// Keep existing routes if needed, but for now we focus on the unified one.
// If frontend needs specific calls, we can add them back later wrapping the service.

export default router;
