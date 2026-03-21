// ── Risk Log Model ──
// Stores every risk prediction for auditing, pattern learning, and trend analysis.

import mongoose from 'mongoose';

const contributingFactorSchema = new mongoose.Schema({
    factor: { type: String, required: true },
    impact: { type: Number, required: true },
    description: { type: String, required: true },
}, { _id: false });

const riskLogSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true, index: true },
    riskScore: { type: Number, required: true },
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true,
    },
    predictedDelayMinutes: { type: Number, default: 0 },
    delayProbability: { type: Number, default: 0 },
    contributingFactors: [contributingFactorSchema],
    confidence: { type: Number, default: 50 },
    decisionAction: { type: String },   // what the decision engine recommended
}, {
    timestamps: true,
});

riskLogSchema.index({ shipmentId: 1, createdAt: -1 });
riskLogSchema.index({ riskLevel: 1, createdAt: -1 });

export const RiskLogModel = mongoose.model('RiskLog', riskLogSchema);
