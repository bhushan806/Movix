// ── Predictive Intelligence Engine — Shared Types ──
// All TypeScript interfaces for the predictive layer.
// Used by: riskPrediction, decisionEngine, alertEngine, monitoring, networkIntelligence, heatmap

// ──────────────────────────────────────────────────
// Module 1: Risk Prediction
// ──────────────────────────────────────────────────

export interface ContributingFactor {
    factor: 'traffic' | 'weather' | 'driver' | 'corridor' | 'goods' | 'time' | 'distance' | 'history';
    impact: number;          // 0-100 contribution to risk score
    description: string;
}

export interface ShipmentRisk {
    shipmentId: string;
    riskScore: number;               // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    predictedDelayMinutes: number;
    delayProbability: number;        // 0-100
    contributingFactors: ContributingFactor[];
    timestamp: string;               // ISO string
    confidence: number;              // 0-100
}

// ──────────────────────────────────────────────────
// Module 2: Decision Engine
// ──────────────────────────────────────────────────

export type DecisionAction = 'CONTINUE' | 'CAUTION' | 'SUGGEST_REROUTE' | 'FORCE_REROUTE' | 'EMERGENCY';

export interface AlternateRoute {
    routeId: string;
    description: string;
    timeSaved: number;               // minutes
    distance: number;                // km difference
    riskScoreAfterReroute: number;   // 0-100
}

export interface EstimatedImpact {
    timeSaved: number;               // minutes
    fuelSaved: number;               // liters
    delayAvoided: boolean;
}

export interface Decision {
    action: DecisionAction;
    primaryRecommendation: string;
    alternateRoutes: AlternateRoute[];
    estimatedImpact: EstimatedImpact;
    requiresApproval: boolean;
    autoExecutable: boolean;
    confidence: number;              // 0-100
}

// ──────────────────────────────────────────────────
// Module 3: Alert Engine
// ──────────────────────────────────────────────────

export type AlertType = 'RISK_HIGH' | 'REROUTE_SUGGESTED' | 'DELAY_CRITICAL' | 'WEATHER_WARNING' | 'NETWORK_CONGESTION';

export interface PredictiveAlert {
    alertId: string;
    shipmentId: string;
    type: AlertType;
    title: string;
    message: string;
    actionRequired: boolean;
    suggestedAction: string;
    actionLink: string;
    timestamp: string;               // ISO string
    read: boolean;
    acknowledged: boolean;
    escalated: boolean;
    userId?: string;                 // target user
}

// ──────────────────────────────────────────────────
// Module 4: Monitoring
// ──────────────────────────────────────────────────

export interface MonitoringCycleResult {
    cycleId: string;
    shipmentsProcessed: number;
    alertsGenerated: number;
    durationMs: number;
    errors: string[];
    timestamp: string;
}

// ──────────────────────────────────────────────────
// Module 5: Network Intelligence
// ──────────────────────────────────────────────────

export interface RegionalRisk {
    regionId: string;
    regionName: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    activeShipments: number;
    highRiskShipments: number;
    primaryFactors: string[];
    timestamp: string;
}

// ──────────────────────────────────────────────────
// Module 6: Heatmap
// ──────────────────────────────────────────────────

export interface HeatmapZone {
    zoneId: string;
    center: { lat: number; lng: number };
    radius: number;                  // meters
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    affectedShipments: number;
    primaryCause: string;
}

export interface HeatmapData {
    timestamp: string;
    zones: HeatmapZone[];
}

// ──────────────────────────────────────────────────
// Shared: Shipment snapshot (lightweight view of a Load for monitoring)
// ──────────────────────────────────────────────────

export interface ShipmentSnapshot {
    id: string;
    source: string;
    destination: string;
    status: string;
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    weight: number;
    goodsType: string;
    distance: number;
    driverId?: string;
    customerId?: string;
    ownerId?: string;
    createdAt: Date;
}
