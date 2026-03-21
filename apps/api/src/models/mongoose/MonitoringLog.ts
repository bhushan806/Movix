// ── Monitoring Log Model ──
// Audit trail for each monitoring cycle. Used for health checks and debugging.

import mongoose from 'mongoose';

const monitoringLogSchema = new mongoose.Schema({
    cycleId: { type: String, required: true, unique: true },
    shipmentsProcessed: { type: Number, default: 0 },
    alertsGenerated: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    errors: [{ type: String }],
}, {
    timestamps: true,
});

monitoringLogSchema.index({ createdAt: -1 });

export const MonitoringLogModel = mongoose.model('MonitoringLog', monitoringLogSchema);
