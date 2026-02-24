// ── AI Module Index ──
// Central export point for all AI modules.
// Routes call Services → Services call AI modules.

export { optimizeRoute } from './routeOptimizer';
export type { RoutePoint, OptimizedRoute } from './routeOptimizer';

export { predictDemand } from './demandPrediction';
export type { DemandContext, DemandPrediction } from './demandPrediction';

export { assessFraudRisk } from './fraudDetection';
export type { TransactionSignal, FraudAssessment } from './fraudDetection';
