// ── Module 5: Network Intelligence Service ──
// Sees the FOREST, not just the trees.
// Aggregates individual shipment risks into regional patterns.
// Detects congestion hotspots, bottlenecks, and fleet-wide optimization opportunities.

import { ShipmentRisk, RegionalRisk, ShipmentSnapshot } from './types';
import { logger } from '../../utils/logger';

// ── Indian Logistics Zones ──
const LOGISTICS_ZONES: Array<{
    id: string;
    name: string;
    center: { lat: number; lng: number };
    radiusKm: number;
}> = [
    { id: 'DEL-NCR', name: 'Delhi NCR', center: { lat: 28.6139, lng: 77.2090 }, radiusKm: 50 },
    { id: 'MUM-MMR', name: 'Mumbai Metropolitan', center: { lat: 19.0760, lng: 72.8777 }, radiusKm: 40 },
    { id: 'MUM-PUN', name: 'Mumbai-Pune Corridor', center: { lat: 18.7500, lng: 73.4000 }, radiusKm: 60 },
    { id: 'BLR-COR', name: 'Bangalore Corridor', center: { lat: 12.9716, lng: 77.5946 }, radiusKm: 35 },
    { id: 'CHN-COR', name: 'Chennai Corridor', center: { lat: 13.0827, lng: 80.2707 }, radiusKm: 35 },
    { id: 'KOL-COR', name: 'Kolkata Corridor', center: { lat: 22.5726, lng: 88.3639 }, radiusKm: 40 },
    { id: 'HYD-COR', name: 'Hyderabad Corridor', center: { lat: 17.3850, lng: 78.4867 }, radiusKm: 35 },
    { id: 'AMD-COR', name: 'Ahmedabad Corridor', center: { lat: 23.0225, lng: 72.5714 }, radiusKm: 30 },
    { id: 'JAI-COR', name: 'Jaipur Corridor', center: { lat: 26.9124, lng: 75.7873 }, radiusKm: 30 },
    { id: 'LKO-COR', name: 'Lucknow Corridor', center: { lat: 26.8467, lng: 80.9462 }, radiusKm: 30 },
];

// ── Haversine distance ──
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Map a shipment to its zone(s) ──
function getShipmentZones(shipment: ShipmentSnapshot): string[] {
    const zones: string[] = [];
    for (const zone of LOGISTICS_ZONES) {
        const distOrigin = haversineKm(shipment.pickupLat, shipment.pickupLng, zone.center.lat, zone.center.lng);
        const distDest = haversineKm(shipment.dropLat, shipment.dropLng, zone.center.lat, zone.center.lng);
        if (distOrigin <= zone.radiusKm || distDest <= zone.radiusKm) {
            zones.push(zone.id);
        }
    }
    return zones;
}

// ══════════════════════════════════════════════════
// MAIN: Analyze network-wide risk patterns
// ══════════════════════════════════════════════════

export async function analyzeNetwork(
    shipments: ShipmentSnapshot[],
    risks: Map<string, ShipmentRisk>
): Promise<RegionalRisk[]> {
    try {
        // Group shipments by zone
        const zoneMap = new Map<string, { shipments: ShipmentSnapshot[]; risks: ShipmentRisk[] }>();

        for (const shipment of shipments) {
            const zones = getShipmentZones(shipment);
            const risk = risks.get(shipment.id);

            for (const zoneId of zones) {
                if (!zoneMap.has(zoneId)) {
                    zoneMap.set(zoneId, { shipments: [], risks: [] });
                }
                const entry = zoneMap.get(zoneId)!;
                entry.shipments.push(shipment);
                if (risk) entry.risks.push(risk);
            }
        }

        // Analyze each zone
        const regionalRisks: RegionalRisk[] = [];
        const now = new Date().toISOString();

        for (const [zoneId, data] of zoneMap.entries()) {
            const zone = LOGISTICS_ZONES.find(z => z.id === zoneId);
            if (!zone) continue;

            const highRiskCount = data.risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
            const avgRiskScore = data.risks.length > 0
                ? data.risks.reduce((sum, r) => sum + r.riskScore, 0) / data.risks.length
                : 0;

            // Determine regional risk level
            let riskLevel: RegionalRisk['riskLevel'] = 'LOW';
            if (highRiskCount >= 3 || avgRiskScore >= 60) riskLevel = 'HIGH';
            else if (highRiskCount >= 1 || avgRiskScore >= 35) riskLevel = 'MEDIUM';

            // Extract primary factors
            const factorCounts = new Map<string, number>();
            for (const risk of data.risks) {
                for (const factor of risk.contributingFactors) {
                    factorCounts.set(factor.description, (factorCounts.get(factor.description) || 0) + factor.impact);
                }
            }
            const primaryFactors = [...factorCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([desc]) => desc);

            regionalRisks.push({
                regionId: zoneId,
                regionName: zone.name,
                riskLevel,
                activeShipments: data.shipments.length,
                highRiskShipments: highRiskCount,
                primaryFactors,
                timestamp: now,
            });
        }

        // Sort: HIGH risk zones first
        regionalRisks.sort((a, b) => {
            const levelOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
        });

        logger.info('Network analysis complete', {
            zonesAnalyzed: regionalRisks.length,
            highRiskZones: regionalRisks.filter(r => r.riskLevel === 'HIGH').length,
        });

        return regionalRisks;
    } catch (error: any) {
        logger.error('Network intelligence failed', { error: error.message });
        return [];
    }
}
