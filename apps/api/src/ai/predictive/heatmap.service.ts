// ── Module 6: Heatmap Data Generator ──
// Transforms raw risk data into visual intelligence for the frontend.
// Returns map-ready JSON with risk zones, centers, and affected shipment counts.

import { HeatmapData, HeatmapZone, ShipmentRisk } from './types';
import { RiskLogModel } from '../../models/mongoose/RiskLog';
import { logger } from '../../utils/logger';

// ── Indian logistics zones for heatmap visualization ──
const HEATMAP_ZONES: Array<{
    zoneId: string;
    center: { lat: number; lng: number };
    radius: number; // meters
    name: string;
    corridors: string[]; // city names that map to this zone
}> = [
    {
        zoneId: 'DEL-NCR-01',
        center: { lat: 28.6139, lng: 77.2090 },
        radius: 25000,
        name: 'Delhi NCR',
        corridors: ['delhi', 'gurgaon', 'noida', 'ghaziabad', 'faridabad'],
    },
    {
        zoneId: 'MUM-CIT-01',
        center: { lat: 19.0760, lng: 72.8777 },
        radius: 20000,
        name: 'Mumbai Metro',
        corridors: ['mumbai', 'thane', 'navi mumbai'],
    },
    {
        zoneId: 'MUM-PUN-01',
        center: { lat: 18.5204, lng: 73.8567 },
        radius: 30000,
        name: 'Mumbai-Pune Expressway',
        corridors: ['pune', 'lonavala'],
    },
    {
        zoneId: 'BLR-CIT-01',
        center: { lat: 12.9716, lng: 77.5946 },
        radius: 20000,
        name: 'Bangalore',
        corridors: ['bangalore', 'bengaluru'],
    },
    {
        zoneId: 'CHN-CIT-01',
        center: { lat: 13.0827, lng: 80.2707 },
        radius: 20000,
        name: 'Chennai',
        corridors: ['chennai'],
    },
    {
        zoneId: 'KOL-CIT-01',
        center: { lat: 22.5726, lng: 88.3639 },
        radius: 20000,
        name: 'Kolkata',
        corridors: ['kolkata'],
    },
    {
        zoneId: 'HYD-CIT-01',
        center: { lat: 17.3850, lng: 78.4867 },
        radius: 20000,
        name: 'Hyderabad',
        corridors: ['hyderabad'],
    },
    {
        zoneId: 'AMD-CIT-01',
        center: { lat: 23.0225, lng: 72.5714 },
        radius: 18000,
        name: 'Ahmedabad',
        corridors: ['ahmedabad'],
    },
    {
        zoneId: 'JAI-CIT-01',
        center: { lat: 26.9124, lng: 75.7873 },
        radius: 15000,
        name: 'Jaipur',
        corridors: ['jaipur'],
    },
    {
        zoneId: 'GOA-CIT-01',
        center: { lat: 15.2993, lng: 74.1240 },
        radius: 20000,
        name: 'Goa',
        corridors: ['goa'],
    },
];

// ══════════════════════════════════════════════════
// MAIN: Generate heatmap data from recent risk logs
// ══════════════════════════════════════════════════

export async function generateHeatmapData(): Promise<HeatmapData> {
    try {
        // Fetch recent risk logs (last 30 minutes)
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);
        const recentLogs = await RiskLogModel.find({ createdAt: { $gte: cutoff } })
            .sort({ createdAt: -1 })
            .lean();

        // If no recent data, generate simulated heatmap based on time of day
        if (recentLogs.length === 0) {
            return generateSimulatedHeatmap();
        }

        // Group risk logs by zone (using shipmentId metadata — simplified)
        const zoneRiskMap = new Map<string, { scores: number[]; factors: string[]; count: number }>();

        // Initialize all zones
        for (const zone of HEATMAP_ZONES) {
            zoneRiskMap.set(zone.zoneId, { scores: [], factors: [], count: 0 });
        }

        // Distribute risk logs across zones based on contributing factors
        for (const log of recentLogs) {
            for (const zone of HEATMAP_ZONES) {
                // Simple heuristic: check if any contributing factor mentions a city in this zone
                const factorText = (log.contributingFactors || []).map((f: any) => f.description.toLowerCase()).join(' ');
                const matches = zone.corridors.some(c => factorText.includes(c));

                if (matches) {
                    const entry = zoneRiskMap.get(zone.zoneId)!;
                    entry.scores.push(log.riskScore);
                    entry.count++;
                    for (const f of (log.contributingFactors || [])) {
                        entry.factors.push((f as any).description);
                    }
                }
            }
        }

        // Build zones
        const zones: HeatmapZone[] = [];
        for (const zone of HEATMAP_ZONES) {
            const data = zoneRiskMap.get(zone.zoneId);
            if (!data || data.count === 0) continue;

            const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
            let riskLevel: HeatmapZone['riskLevel'] = 'LOW';
            if (avgScore >= 86) riskLevel = 'CRITICAL';
            else if (avgScore >= 61) riskLevel = 'HIGH';
            else if (avgScore >= 31) riskLevel = 'MEDIUM';

            // Most common factor
            const factorCounts = new Map<string, number>();
            for (const f of data.factors) {
                factorCounts.set(f, (factorCounts.get(f) || 0) + 1);
            }
            const primaryCause = [...factorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Multiple factors';

            zones.push({
                zoneId: zone.zoneId,
                center: zone.center,
                radius: zone.radius,
                riskLevel,
                riskScore: avgScore,
                affectedShipments: data.count,
                primaryCause,
            });
        }

        return {
            timestamp: new Date().toISOString(),
            zones: zones.sort((a, b) => b.riskScore - a.riskScore),
        };
    } catch (error: any) {
        logger.error('Heatmap generation failed', { error: error.message });
        return generateSimulatedHeatmap();
    }
}

// ── Fallback: simulated heatmap based on time-of-day ──
function generateSimulatedHeatmap(): HeatmapData {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
    const isNight = hour >= 22 || hour < 5;

    const zones: HeatmapZone[] = [
        {
            zoneId: 'DEL-NCR-01',
            center: { lat: 28.6139, lng: 77.2090 },
            radius: 25000,
            riskLevel: isRushHour ? 'HIGH' : 'MEDIUM',
            riskScore: isRushHour ? 72 : 38,
            affectedShipments: isRushHour ? 15 : 6,
            primaryCause: isRushHour ? 'Heavy traffic congestion on NH-48' : 'Normal traffic flow',
        },
        {
            zoneId: 'MUM-PUN-01',
            center: { lat: 18.5204, lng: 73.8567 },
            radius: 30000,
            riskLevel: isRushHour ? 'HIGH' : 'LOW',
            riskScore: isRushHour ? 68 : 25,
            affectedShipments: isRushHour ? 12 : 4,
            primaryCause: isRushHour ? 'Expressway congestion near toll plazas' : 'Clear conditions',
        },
        {
            zoneId: 'MUM-CIT-01',
            center: { lat: 19.0760, lng: 72.8777 },
            radius: 20000,
            riskLevel: isRushHour ? 'CRITICAL' : 'MEDIUM',
            riskScore: isRushHour ? 88 : 42,
            affectedShipments: isRushHour ? 18 : 8,
            primaryCause: isRushHour ? 'Peak hour gridlock on Western Express Highway' : 'Moderate traffic',
        },
        {
            zoneId: 'BLR-CIT-01',
            center: { lat: 12.9716, lng: 77.5946 },
            radius: 20000,
            riskLevel: isRushHour ? 'HIGH' : 'LOW',
            riskScore: isRushHour ? 65 : 22,
            affectedShipments: isRushHour ? 10 : 3,
            primaryCause: isRushHour ? 'ORR traffic bottleneck' : 'Smooth traffic',
        },
    ];

    if (isNight) {
        // Add night-specific risks
        zones.push({
            zoneId: 'JAI-CIT-01',
            center: { lat: 26.9124, lng: 75.7873 },
            radius: 15000,
            riskLevel: 'MEDIUM',
            riskScore: 40,
            affectedShipments: 3,
            primaryCause: 'Night driving on poorly lit highway stretches',
        });
    }

    return {
        timestamp: new Date().toISOString(),
        zones,
    };
}
