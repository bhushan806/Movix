import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.post('/eta', aiController.calculateEta);
router.post('/sos', aiController.triggerSos);
router.post('/match', aiController.matchDrivers);

export default router;
