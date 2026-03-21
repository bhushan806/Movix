// ── Predictive Intelligence Controller ──
// Handles REST API endpoints for the predictive intelligence layer.

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MonitoringService, getUserAlerts, acknowledgeAlert, generateHeatmapData, predictShipmentRisk, generateDecision, analyzeNetwork } from '../ai/predictive';
import { LoadModel } from '../models/mongoose/Load';
import { logger } from '../utils/logger';

// GET /api/predictive/status — Monitoring health check
export const getStatus = async (_req: AuthRequest, res: Response) => {
    try {
        const status = MonitoringService.getInstance().getStatus();
        res.json({ status: 'success', data: status });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// GET /api/predictive/alerts — User's alerts (paginated)
export const getAlerts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        const result = await getUserAlerts(userId, { page, limit, unreadOnly });
        res.json({ status: 'success', data: result });
    } catch (error: any) {
        logger.error('Failed to fetch alerts', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to fetch alerts' });
    }
};

// PATCH /api/predictive/alerts/:id/acknowledge — Acknowledge an alert
export const acknowledgeAlertHandler = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const success = await acknowledgeAlert(id);
        if (success) {
            res.json({ status: 'success', message: 'Alert acknowledged' });
        } else {
            res.status(404).json({ status: 'error', message: 'Alert not found' });
        }
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// GET /api/predictive/heatmap — Current risk heatmap data
export const getHeatmap = async (_req: AuthRequest, res: Response) => {
    try {
        const heatmapData = await generateHeatmapData();
        res.json({ status: 'success', data: heatmapData });
    } catch (error: any) {
        logger.error('Failed to generate heatmap', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to generate heatmap data' });
    }
};

// GET /api/predictive/network — Network intelligence summary
export const getNetworkIntelligence = async (_req: AuthRequest, res: Response) => {
    try {
        // Fetch active shipments
        const activeLoads = await LoadModel.find({ status: 'IN_TRANSIT' }).limit(100).lean();

        const shipments = activeLoads.map((load: any) => ({
            id: (load._id || load.id).toString(),
            source: load.source || '',
            destination: load.destination || '',
            status: load.status,
            pickupLat: load.pickupLat || 18.52,
            pickupLng: load.pickupLng || 73.85,
            dropLat: load.dropLat || 19.07,
            dropLng: load.dropLng || 72.87,
            weight: load.weight || 10,
            goodsType: load.goodsType || 'general',
            distance: load.distance || 150,
            driverId: load.driverId?.toString(),
            customerId: load.customerId?.toString(),
            ownerId: load.ownerId?.toString(),
            createdAt: load.createdAt || new Date(),
        }));

        // Run risk predictions for all shipments
        const riskMap = new Map();
        const risks = await Promise.allSettled(
            shipments.map(async (s: any) => {
                const risk = await predictShipmentRisk(s);
                riskMap.set(s.id, risk);
                return risk;
            })
        );

        // Analyze network
        const networkData = await analyzeNetwork(shipments, riskMap);

        res.json({
            status: 'success',
            data: {
                regions: networkData,
                totalShipments: shipments.length,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        logger.error('Network intelligence failed', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to generate network intelligence' });
    }
};

// GET /api/predictive/shipment/:id/risk — On-demand risk for a specific load
export const getShipmentRisk = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const load = await LoadModel.findById(id).lean();

        if (!load) {
            return res.status(404).json({ status: 'error', message: 'Shipment not found' });
        }

        const shipment = {
            id: (load._id || (load as any).id).toString(),
            source: load.source || '',
            destination: load.destination || '',
            status: load.status,
            pickupLat: load.pickupLat || 18.52,
            pickupLng: load.pickupLng || 73.85,
            dropLat: load.dropLat || 19.07,
            dropLng: load.dropLng || 72.87,
            weight: load.weight || 10,
            goodsType: load.goodsType || 'general',
            distance: load.distance || 150,
            driverId: load.driverId?.toString(),
            customerId: load.customerId?.toString(),
            ownerId: load.ownerId?.toString(),
            createdAt: load.createdAt || new Date(),
        };

        const risk = await predictShipmentRisk(shipment);
        const decision = await generateDecision(risk, shipment);

        res.json({
            status: 'success',
            data: { risk, decision },
        });
    } catch (error: any) {
        logger.error('Shipment risk prediction failed', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to predict shipment risk' });
    }
};
