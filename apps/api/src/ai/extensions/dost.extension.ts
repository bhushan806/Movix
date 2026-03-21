// ── Dost Extension: Predictive Intelligence Context Injection ──
// Enhances TruckNet Dost with predictive intelligence context.
// This is the EXTENSION layer — it wraps, doesn't replace.

import { RiskLogModel } from '../../models/mongoose/RiskLog';
import { LoadModel } from '../../models/mongoose/Load';
import { logger } from '../../utils/logger';

interface PredictiveContext {
    hasActiveRisks: boolean;
    shipmentSummary?: string;
    riskDetails?: Array<{
        shipmentId: string;
        route: string;
        riskScore: number;
        riskLevel: string;
        predictedDelay: number;
        topReason: string;
        recommendedAction: string;
    }>;
}

/**
 * Enriches the Dost system prompt with predictive intelligence context.
 * Called before the LLM call to inject real-time risk awareness.
 * 
 * @param userId - The current user's ID
 * @param role - User role (CUSTOMER, DRIVER, OWNER)
 * @returns Additional context string to append to the system prompt
 */
export async function enrichWithPredictiveContext(userId: string, role: string): Promise<string> {
    try {
        // Find active shipments for this user
        const filter: any = { status: 'IN_TRANSIT' };
        if (role === 'CUSTOMER') filter.customerId = userId;
        else if (role === 'OWNER') filter.ownerId = userId;
        else if (role === 'DRIVER') filter.driverId = userId;

        const activeLoads = await LoadModel.find(filter).limit(5).lean();
        
        if (activeLoads.length === 0) {
            return ''; // No active shipments — no context to inject
        }

        // Get latest risk assessments for these shipments
        const riskDetails: PredictiveContext['riskDetails'] = [];

        for (const load of activeLoads) {
            const loadId = (load._id || (load as any).id).toString();
            const latestRisk = await RiskLogModel.findOne({ shipmentId: loadId })
                .sort({ createdAt: -1 })
                .lean();

            if (latestRisk) {
                const topFactor = (latestRisk.contributingFactors as any[])?.[0];
                riskDetails.push({
                    shipmentId: loadId,
                    route: `${load.source} → ${load.destination}`,
                    riskScore: latestRisk.riskScore,
                    riskLevel: latestRisk.riskLevel,
                    predictedDelay: latestRisk.predictedDelayMinutes,
                    topReason: topFactor?.description || 'Standard monitoring',
                    recommendedAction: latestRisk.decisionAction || 'CONTINUE',
                });
            }
        }

        if (riskDetails.length === 0) {
            return '';
        }

        // Build context string for the LLM
        const hasHighRisk = riskDetails.some(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');
        
        let context = `\n\n🔮 PREDICTIVE INTELLIGENCE (REAL-TIME):\n`;
        context += `Active shipments being monitored: ${riskDetails.length}\n`;
        
        if (hasHighRisk) {
            context += `⚠️ HIGH RISK DETECTED on some shipments!\n`;
        }

        for (const risk of riskDetails) {
            const emoji = risk.riskLevel === 'LOW' ? '🟢' : risk.riskLevel === 'MEDIUM' ? '🟡' : risk.riskLevel === 'HIGH' ? '🔴' : '🚨';
            context += `\n${emoji} Shipment ${risk.route}:`;
            context += `\n   Risk: ${risk.riskLevel} (${risk.riskScore}/100)`;
            context += `\n   Predicted delay: ~${risk.predictedDelay} minutes`;
            context += `\n   Reason: ${risk.topReason}`;
            context += `\n   Action: ${risk.recommendedAction}`;
        }

        context += `\n\nWhen user asks about shipments/delays/risk, use this data to give PROACTIVE answers.`;
        context += `\nExplain risks in simple language. Suggest actions. Be specific with numbers.`;

        logger.debug('Predictive context injected', { userId, risks: riskDetails.length });

        return context;
    } catch (error: any) {
        logger.warn('Predictive context enrichment failed (non-blocking)', { error: error.message });
        return ''; // Graceful degradation — Dost works without predictive context
    }
}
