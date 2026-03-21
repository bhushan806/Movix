// ── Module 3: Alert Engine ──
// Creates, stores, and dispatches alerts to the right users at the right time.
// Features: deduplication, auto-escalation, real-time Socket.io emission.

import { ShipmentRisk, Decision, PredictiveAlert, AlertType, ShipmentSnapshot } from './types';
import { AlertModel } from '../../models/mongoose/Alert';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

// Try to import Socket.io — gracefully degrade if not initialized
let getIO: (() => any) | null = null;
try {
    const socketModule = require('../../config/socket');
    getIO = socketModule.getIO;
} catch {
    logger.warn('Socket.io not available for alert engine — alerts will be DB-only');
}

// ── Deduplication cache (in-memory, shipmentId+type → timestamp) ──
const recentAlerts = new Map<string, number>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isDuplicate(shipmentId: string, type: AlertType): boolean {
    const key = `${shipmentId}:${type}`;
    const lastAlert = recentAlerts.get(key);
    if (lastAlert && Date.now() - lastAlert < DEDUP_WINDOW_MS) {
        return true;
    }
    recentAlerts.set(key, Date.now());
    return false;
}

// Clean stale entries periodically
setInterval(() => {
    const cutoff = Date.now() - DEDUP_WINDOW_MS;
    for (const [key, ts] of recentAlerts.entries()) {
        if (ts < cutoff) recentAlerts.delete(key);
    }
}, 5 * 60 * 1000);

// ── Alert creation logic ──
function buildAlert(risk: ShipmentRisk, decision: Decision, shipment: ShipmentSnapshot): PredictiveAlert | null {
    let type: AlertType;
    let title: string;
    let message: string;
    let actionRequired = false;

    if (risk.riskLevel === 'CRITICAL') {
        type = 'DELAY_CRITICAL';
        title = `🚨 CRITICAL: Shipment ${shipment.source} → ${shipment.destination}`;
        message = `Predicted delay: ${risk.predictedDelayMinutes} mins. ${decision.primaryRecommendation}`;
        actionRequired = true;
    } else if (risk.riskLevel === 'HIGH') {
        type = 'RISK_HIGH';
        title = `⚠️ HIGH RISK: ${shipment.source} → ${shipment.destination}`;
        message = `Risk score: ${risk.riskScore}/100. ${decision.primaryRecommendation}`;
        actionRequired = true;
    } else if (decision.action === 'SUGGEST_REROUTE') {
        type = 'REROUTE_SUGGESTED';
        title = `🔀 Reroute Suggested: ${shipment.source} → ${shipment.destination}`;
        message = decision.primaryRecommendation;
        actionRequired = false;
    } else if (risk.contributingFactors.some(f => f.factor === 'weather' && f.impact >= 15)) {
        type = 'WEATHER_WARNING';
        title = `🌧️ Weather Alert: ${shipment.source} → ${shipment.destination}`;
        const weatherFactor = risk.contributingFactors.find(f => f.factor === 'weather');
        message = weatherFactor?.description || 'Adverse weather conditions on route';
        actionRequired = false;
    } else {
        // No alert needed for LOW/MEDIUM risk with no special conditions
        return null;
    }

    // Check deduplication
    if (isDuplicate(risk.shipmentId, type)) {
        return null;
    }

    return {
        alertId: crypto.randomUUID(),
        shipmentId: risk.shipmentId,
        type,
        title,
        message,
        actionRequired,
        suggestedAction: decision.primaryRecommendation,
        actionLink: `/dashboard/tracking/${risk.shipmentId}`,
        timestamp: new Date().toISOString(),
        read: false,
        acknowledged: false,
        escalated: false,
        userId: shipment.customerId || shipment.ownerId,
    };
}

// ══════════════════════════════════════════════════
// MAIN: Process risk + decision → generate & dispatch alert
// ══════════════════════════════════════════════════

export async function processAlert(
    risk: ShipmentRisk,
    decision: Decision,
    shipment: ShipmentSnapshot
): Promise<PredictiveAlert | null> {
    try {
        const alert = buildAlert(risk, decision, shipment);
        if (!alert) return null;

        // 1. Persist to database
        await AlertModel.create({
            shipmentId: alert.shipmentId,
            type: alert.type,
            title: alert.title,
            message: alert.message,
            actionRequired: alert.actionRequired,
            suggestedAction: alert.suggestedAction,
            actionLink: alert.actionLink,
            read: false,
            acknowledged: false,
            escalated: false,
            userId: alert.userId,
            riskScore: risk.riskScore,
            riskLevel: risk.riskLevel,
        });

        // 2. Emit via Socket.io (real-time)
        if (getIO && alert.userId) {
            try {
                const io = getIO();
                io.to(alert.userId).emit('predictive:alert', alert);
                logger.debug('Alert emitted via Socket.io', { alertId: alert.alertId, userId: alert.userId });
            } catch {
                // Socket not ready — non-blocking
            }
        }

        // 3. Schedule auto-escalation for CRITICAL alerts
        if (alert.type === 'DELAY_CRITICAL' && !alert.acknowledged) {
            scheduleEscalation(alert.alertId, alert.shipmentId);
        }

        logger.info('Alert generated', {
            alertId: alert.alertId,
            type: alert.type,
            shipmentId: alert.shipmentId,
        });

        return alert;
    } catch (error: any) {
        logger.error('Alert processing failed', { shipmentId: risk.shipmentId, error: error.message });
        return null;
    }
}

// ── Auto-escalation: unacknowledged CRITICAL alerts after 5 minutes ──
function scheduleEscalation(alertId: string, shipmentId: string): void {
    setTimeout(async () => {
        try {
            const alert = await AlertModel.findOne({
                shipmentId,
                type: 'DELAY_CRITICAL',
                acknowledged: false,
                escalated: false,
            }).sort({ createdAt: -1 });

            if (alert) {
                alert.escalated = true;
                await alert.save();

                // Emit escalation event
                if (getIO && alert.userId) {
                    try {
                        const io = getIO();
                        io.to(alert.userId).emit('predictive:escalation', {
                            alertId: alert._id,
                            shipmentId,
                            message: '⏰ ESCALATED: Critical alert was not acknowledged within 5 minutes',
                        });
                    } catch { /* non-blocking */ }
                }

                logger.warn('Alert auto-escalated', { alertId: alert._id, shipmentId });
            }
        } catch (error: any) {
            logger.error('Alert escalation failed', { alertId, error: error.message });
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// ── Fetch alerts for a user (paginated) ──
export async function getUserAlerts(userId: string, options: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const filter: any = { userId };
    if (unreadOnly) filter.read = false;

    const [alerts, total] = await Promise.all([
        AlertModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        AlertModel.countDocuments(filter),
    ]);

    return { alerts, total, page, limit };
}

// ── Acknowledge an alert ──
export async function acknowledgeAlert(alertId: string): Promise<boolean> {
    const result = await AlertModel.findByIdAndUpdate(alertId, {
        acknowledged: true,
        read: true,
    });
    return !!result;
}
