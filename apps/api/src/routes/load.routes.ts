import { Router } from 'express';
import * as loadController from '../controllers/load.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('OWNER'));

router.post('/', loadController.createLoad);
router.get('/', loadController.getLoads);

export default router;
