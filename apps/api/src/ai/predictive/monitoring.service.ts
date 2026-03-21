// ── Module 4: Continuous Monitoring Service (THE HEARTBEAT) ──
// The engine that never sleeps. Every active shipment gets evaluated every 15 seconds.
// Crash-proof: errors are logged but NEVER break the loop.

import { ShipmentSnapshot, ShipmentRisk, MonitoringCycleResult } from './types';
import { predictShipmentRisk } from './riskPrediction.service';
import { generateDecision } from './decisionEngine.service';
import { processAlert } from './alertEngine.service';
import { analyzeNetwork } from './networkIntelligence.service';
import { RiskLogModel } from '../../models/mongoose/RiskLog';
import { MonitoringLogModel } from '../../models/mongoose/MonitoringLog';
import { LoadModel } from '../../models/mongoose/Load';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

class MonitoringService {
    private static instance: MonitoringService;
    private isRunning = false;
    private cycleCount = 0;
    private baseIntervalMs = 15000; // 15 seconds
    private lastCycleResult: MonitoringCycleResult | null = null;

    private constructor() {}

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    // ── Public: Start the monitoring loop (non-blocking) ──
    async start(): Promise<void> {
        if (this.isRunning) {
            logger.warn('Monitoring service already running');
            return;
        }

        this.isRunning = true;
        logger.info('🔄 Predictive Monitoring Service STARTED', { intervalMs: this.baseIntervalMs });

        // Run loop in background (non-blocking)
        this.runLoop().catch(err => {
            logger.error('Monitoring loop crashed unexpectedly', { error: err.message });
            this.isRunning = false;
        });
    }

    // ── Public: Stop the monitoring loop ──
    stop(): void {
        this.isRunning = false;
        logger.info('⏹️ Predictive Monitoring Service STOPPED');
    }

    // ── Public: Health status ──
    getStatus() {
        return {
            isRunning: this.isRunning,
            cycleCount: this.cycleCount,
            lastCycle: this.lastCycleResult,
            intervalMs: this.baseIntervalMs,
        };
    }

    // ── Private: Main loop ──
    private async runLoop(): Promise<void> {
        while (this.isRunning) {
            try {
                await this.monitoringCycle();
            } catch (error: any) {
                // CRITICAL: Never let the loop die
                logger.error('Monitoring cycle error (non-fatal)', { error: error.message });
            }

            // Jittered sleep to prevent sync storms
            const jitter = Math.random() * 5000; // 0-5s jitter
            await this.sleep(this.baseIntervalMs + jitter);
        }
    }

    // ── Private: Single monitoring cycle ──
    private async monitoringCycle(): Promise<void> {
        const cycleId = crypto.randomUUID();
        const startTime = Date.now();
        const errors: string[] = [];
        let alertsGenerated = 0;

        this.cycleCount++;

        try {
            // 1. Fetch active shipments (IN_TRANSIT)
            const activeLoads = await LoadModel.find({ status: 'IN_TRANSIT' })
                .limit(100)
                .lean();

            if (activeLoads.length === 0) {
                // No active shipments — quiet cycle
                this.lastCycleResult = {
                    cycleId,
                    shipmentsProcessed: 0,
                    alertsGenerated: 0,
                    durationMs: Date.now() - startTime,
                    errors: [],
                    timestamp: new Date().toISOString(),
                };
                return;
            }

            // 2. Convert to ShipmentSnapshots
            const shipments: ShipmentSnapshot[] = activeLoads.map((load: any) => ({
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

            // 3. Process each shipment in parallel
            const riskMap = new Map<string, ShipmentRisk>();

            const results = await Promise.allSettled(
                shipments.map(async (shipment) => {
                    try {
                        return await this.analyzeShipment(shipment);
                    } catch (err: any) {
                        errors.push(`Shipment ${shipment.id}: ${err.message}`);
                        return null;
                    }
                })
            );

            // Collect results
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    const { risk, alertGenerated } = result.value;
                    riskMap.set(risk.shipmentId, risk);
                    if (alertGenerated) alertsGenerated++;
                }
            }

            // 4. Network Intelligence (every 5th cycle — ~75 seconds)
            if (this.cycleCount % 5 === 0) {
                try {
                    await analyzeNetwork(shipments, riskMap);
                } catch (err: any) {
                    errors.push(`Network analysis: ${err.message}`);
                }
            }

            // 5. Log the cycle
            const durationMs = Date.now() - startTime;
            this.lastCycleResult = {
                cycleId,
                shipmentsProcessed: shipments.length,
                alertsGenerated,
                durationMs,
                errors,
                timestamp: new Date().toISOString(),
            };

            // Persist monitoring log (non-blocking)
            MonitoringLogModel.create({
                cycleId,
                shipmentsProcessed: shipments.length,
                alertsGenerated,
                durationMs,
                errors,
            }).catch(err => logger.warn('Failed to save monitoring log', { error: err.message }));

            if (durationMs > 5000) {
                logger.warn('Monitoring cycle exceeded 5s', { cycleId, durationMs, shipments: shipments.length });
            }

        } catch (error: any) {
            errors.push(error.message);
            this.lastCycleResult = {
                cycleId,
                shipmentsProcessed: 0,
                alertsGenerated: 0,
                durationMs: Date.now() - startTime,
                errors,
                timestamp: new Date().toISOString(),
            };
        }
    }

    // ── Private: Analyze a single shipment (MUST NOT throw) ──
    private async analyzeShipment(shipment: ShipmentSnapshot): Promise<{
        risk: ShipmentRisk;
        alertGenerated: boolean;
    }> {
        // 1. Predict risk
        const risk = await predictShipmentRisk(shipment);

        // 2. Log risk to database (non-blocking)
        RiskLogModel.create({
            shipmentId: risk.shipmentId,
            riskScore: risk.riskScore,
            riskLevel: risk.riskLevel,
            predictedDelayMinutes: risk.predictedDelayMinutes,
            delayProbability: risk.delayProbability,
            contributingFactors: risk.contributingFactors,
            confidence: risk.confidence,
        }).catch(err => logger.warn('Failed to save risk log', { error: err.message }));

        // 3. Decision + Alert (only if risk is significant)
        let alertGenerated = false;
        if (risk.riskScore > 30) {
            const decision = await generateDecision(risk, shipment);

            // Update risk log with decision
            RiskLogModel.findOneAndUpdate(
                { shipmentId: risk.shipmentId },
                { decisionAction: decision.action },
                { sort: { createdAt: -1 } }
            ).catch(() => { /* non-blocking */ });

            if (risk.riskScore > 60) {
                const alert = await processAlert(risk, decision, shipment);
                alertGenerated = !!alert;
            }
        }

        return { risk, alertGenerated };
    }

    // ── Utility ──
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export { MonitoringService };
