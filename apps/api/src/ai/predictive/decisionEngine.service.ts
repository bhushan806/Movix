// ── Module 2: Decision Engine ──
// Turns risk predictions into ACTIONS. Thinks like a veteran fleet manager.
// Uses a decision matrix mapping risk levels and contributing factors to actions.

import { ShipmentRisk, Decision, DecisionAction, AlternateRoute, ShipmentSnapshot } from './types';
import { logger } from '../../utils/logger';

// ── Alternate route templates (simulated) ──
const ROUTE_ALTERNATIVES: Record<string, AlternateRoute[]> = {
    'mumbai-pune': [
        { routeId: 'ALT-MP-1', description: 'Via NH-148A (Old Mumbai-Pune Highway)', timeSaved: 20, distance: 8, riskScoreAfterReroute: 25 },
        { routeId: 'ALT-MP-2', description: 'Via Lonavala-Khandala bypass road', timeSaved: 15, distance: 12, riskScoreAfterReroute: 30 },
    ],
    'pune-mumbai': [
        { routeId: 'ALT-PM-1', description: 'Via NH-148A (Old Highway)', timeSaved: 18, distance: 8, riskScoreAfterReroute: 28 },
    ],
    'delhi-jaipur': [
        { routeId: 'ALT-DJ-1', description: 'Via Rewari-Narnaul route', timeSaved: 25, distance: 15, riskScoreAfterReroute: 22 },
    ],
    'kolkata-delhi': [
        { routeId: 'ALT-KD-1', description: 'Via Lucknow (NH-27)', timeSaved: 30, distance: -20, riskScoreAfterReroute: 35 },
    ],
    'delhi-chandigarh': [
        { routeId: 'ALT-DC-1', description: 'Via Panipat-Karnal alternate', timeSaved: 15, distance: 5, riskScoreAfterReroute: 20 },
    ],
};

// Default alternate when no specific route exists
const DEFAULT_ALTERNATE: AlternateRoute = {
    routeId: 'ALT-GEN-1',
    description: 'Alternative route via secondary highways',
    timeSaved: 15,
    distance: 10,
    riskScoreAfterReroute: 30,
};

// ── Decision Matrix ──
function determineAction(risk: ShipmentRisk): DecisionAction {
    const { riskScore, riskLevel, contributingFactors } = risk;

    // CRITICAL: Always emergency
    if (riskLevel === 'CRITICAL') return 'EMERGENCY';

    // HIGH: Check if traffic is the main factor
    if (riskLevel === 'HIGH') {
        const trafficFactor = contributingFactors.find(f => f.factor === 'traffic');
        const weatherFactor = contributingFactors.find(f => f.factor === 'weather');

        if ((trafficFactor && trafficFactor.impact >= 25) || (weatherFactor && weatherFactor.impact >= 20)) {
            return 'FORCE_REROUTE';
        }
        return 'SUGGEST_REROUTE';
    }

    // MEDIUM: Suggest caution or reroute based on specific factors
    if (riskLevel === 'MEDIUM') {
        const hasTrafficIssue = contributingFactors.some(f => f.factor === 'traffic' && f.impact >= 20);
        if (hasTrafficIssue && riskScore >= 45) {
            return 'SUGGEST_REROUTE';
        }
        return 'CAUTION';
    }

    // LOW: Continue
    return 'CONTINUE';
}

// ── Primary recommendation text ──
function buildRecommendation(action: DecisionAction, risk: ShipmentRisk): string {
    const topFactor = risk.contributingFactors[0]; // already sorted by impact

    switch (action) {
        case 'CONTINUE':
            return 'All clear — continue on current route. No significant risks detected.';
        case 'CAUTION':
            return `Proceed with caution. ${topFactor?.description || 'Minor risk factors detected'}. Estimated delay: ~${risk.predictedDelayMinutes} minutes.`;
        case 'SUGGEST_REROUTE':
            return `Consider alternate route to avoid ${topFactor?.description || 'detected risk'}. Could save ~${risk.predictedDelayMinutes} minutes delay.`;
        case 'FORCE_REROUTE':
            return `⚠️ Strong recommendation to reroute NOW. ${topFactor?.description}. Predicted delay: ${risk.predictedDelayMinutes} minutes if current route is maintained.`;
        case 'EMERGENCY':
            return `🚨 EMERGENCY: Critical risk detected — ${topFactor?.description}. Immediate action required. Contact fleet manager and driver.`;
    }
}

// ══════════════════════════════════════════════════
// MAIN: Generate decision for a shipment based on risk
// ══════════════════════════════════════════════════

export async function generateDecision(risk: ShipmentRisk, shipment: ShipmentSnapshot): Promise<Decision> {
    try {
        const action = determineAction(risk);
        const recommendation = buildRecommendation(action, risk);

        // Get alternate routes
        const corridorKey = `${shipment.source.toLowerCase()}-${shipment.destination.toLowerCase()}`;
        let alternateRoutes: AlternateRoute[] = [];

        if (action === 'SUGGEST_REROUTE' || action === 'FORCE_REROUTE' || action === 'EMERGENCY') {
            alternateRoutes = ROUTE_ALTERNATIVES[corridorKey] || [DEFAULT_ALTERNATE];
        }

        // Estimated impact
        const bestAlt = alternateRoutes[0];
        const estimatedImpact = {
            timeSaved: bestAlt ? bestAlt.timeSaved : 0,
            fuelSaved: bestAlt ? Math.round(bestAlt.timeSaved * 0.4) : 0, // ~0.4 liters per minute saved
            delayAvoided: action !== 'CONTINUE' && action !== 'CAUTION',
        };

        // Approval and auto-execution logic
        const requiresApproval = action === 'FORCE_REROUTE' || action === 'EMERGENCY';
        const autoExecutable = action === 'CONTINUE' || action === 'CAUTION';

        // Confidence: higher when we have more data
        let confidence = risk.confidence;
        if (alternateRoutes.length > 0) confidence = Math.min(95, confidence + 5);

        logger.info('Decision generated', {
            shipmentId: shipment.id,
            action,
            riskScore: risk.riskScore,
            confidence,
        });

        return {
            action,
            primaryRecommendation: recommendation,
            alternateRoutes,
            estimatedImpact,
            requiresApproval,
            autoExecutable,
            confidence,
        };
    } catch (error: any) {
        logger.error('Decision engine failed', { shipmentId: shipment.id, error: error.message });

        // Safe fallback: suggest caution
        return {
            action: 'CAUTION',
            primaryRecommendation: 'Decision engine encountered an error. Proceed with standard caution.',
            alternateRoutes: [],
            estimatedImpact: { timeSaved: 0, fuelSaved: 0, delayAvoided: false },
            requiresApproval: false,
            autoExecutable: false,
            confidence: 10,
        };
    }
}
