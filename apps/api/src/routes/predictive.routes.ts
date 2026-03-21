// ── Predictive Intelligence Routes ──
// All endpoints under /api/predictive

import { Router } from 'express';
import * as predictiveController from '../controllers/predictive.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Health & Status
router.get('/status', predictiveController.getStatus);

// Alerts
router.get('/alerts', predictiveController.getAlerts);
router.patch('/alerts/:id/acknowledge', predictiveController.acknowledgeAlertHandler);

// Visualization
router.get('/heatmap', predictiveController.getHeatmap);

// Network Intelligence
router.get('/network', predictiveController.getNetworkIntelligence);

// On-demand risk
router.get('/shipment/:id/risk', predictiveController.getShipmentRisk);

export default router;
