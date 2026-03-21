import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Ensure all routes are protected
router.use(protect);

// ── Role Isolation Middleware ──
const ensureRole = (requiredRole: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role !== requiredRole) {
            res.status(403).json({ status: 'error', message: `Access Denied: Requires ${requiredRole} role.` });
            return;
        }
        next();
    };
};

// ── 1. Driver Alert Filter Layer (AI Co-Driver) ──
// POST /api/intelligence/driver-alert
// Ingests raw routing anomalies and synthesizes driver-friendly voice/text alerts.
router.post('/driver-alert', ensureRole('DRIVER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { decisions = [] } = req.body;
        
        // Filter out macro/managerial noise — keep only local, critical alerts
        const driverActionableAlerts = decisions.filter((d: any) => d.urgency === 'CRITICAL' || d.type === 'ROUTE_CHANGE');
        
        // Mocking the LLM synthesis for speed/demo purposes
        let instruction = "Route is clear. Have a safe journey.";
        if (driverActionableAlerts.length > 0) {
            const firstAlert = driverActionableAlerts[0];
            if (firstAlert.type === 'WEATHER') {
                instruction = `Severe weather detected ahead. Recommend reducing speed by 15 km/h.`;
            } else if (firstAlert.type === 'ROUTE_CHANGE') {
                instruction = `Traffic congestion ahead. Re-routing via alternate highway saves 45 minutes.`;
            } else {
                instruction = `Critical anomaly detected: ${firstAlert.description}. Exercise caution.`;
            }
        }

        res.status(200).json({
            status: 'success',
            instruction,
            alerts: driverActionableAlerts
        });
    } catch (error) {
        next(error);
    }
});

// ── 2. Fatigue & Stress Detection (Mock) ──
// GET /api/intelligence/fatigue
router.get('/fatigue', ensureRole('DRIVER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Mock calculating fatigue based on time of day and continuous drive time
        const currentHour = new Date().getHours();
        
        // Simple heuristic: higher fatigue late at night or early morning
        let fatigueScore = 20; // base score out of 100
        if (currentHour >= 22 || currentHour <= 4) fatigueScore += 50; 
        
        // Simulate a random variance
        fatigueScore += Math.floor(Math.random() * 20);
        
        // Ensure max 100
        fatigueScore = Math.min(fatigueScore, 100);
        
        let recommendation = "You are good to drive.";
        if (fatigueScore > 75) {
            recommendation = "You have been driving for a while. Let's take a 15-minute break. Finding a safe Dhaba nearby.";
        }

        res.status(200).json({
            status: 'success',
            fatigueScore,
            recommendation,
            isCritical: fatigueScore > 75
        });
    } catch (error) {
        next(error);
    }
});

// ── 3. Earnings Transparency Mock ──
// GET /api/intelligence/earnings
router.get('/earnings', ensureRole('DRIVER'), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Fix: Role Isolation guarantees only the driver sees this.
        // Mock returning the exact transparent cut vs. owner billing
        
        const totalTripValue = 15000;
        const driverSharePercentage = 20; // 20% mock share
        const driverEarnings = (totalTripValue * driverSharePercentage) / 100;
        
        const insights = "Your earnings match the standard transparent bracket. Safe route bonuses projected at +₹500 for on-time delivery.";

        res.status(200).json({
            status: 'success',
            tripValue: totalTripValue,
            driverShare: driverSharePercentage,
            yourEarnings: driverEarnings,
            insights
        });
    } catch (error) {
        next(error);
    }
});

export default router;
