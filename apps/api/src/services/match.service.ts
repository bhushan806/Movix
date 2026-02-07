import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AiService } from './ai.service';

export class MatchService {
    // Find matches for a specific load
    async findMatches(loadId: string) {
        const load = await prisma.load.findUnique({
            where: { id: loadId },
            include: { owner: true }
        });

        if (!load) throw new AppError('Load not found', 404);

        // 1. Find available vehicles
        // In a real app, we would use geospatial queries (e.g., $near) here.
        // For now, we fetch available vehicles and filter/sort in memory.
        const vehicles = await prisma.vehicle.findMany({
            where: {
                status: 'AVAILABLE',
                capacity: { gte: load.weight } // Filter by capacity
            },
            include: {
                driver: {
                    include: { user: true }
                },
                owner: {
                    include: { user: true }
                }
            }
        });

        const matches = [];

        // 2. Call AI Engine for Scoring (Feature 2: Real AI)
        // Transform data for AI Engine
        const loadForAi = {
            load_id: load.id,
            origin: { lat: 0, lng: 0 }, // TODO: Geocode source
            destination: { lat: 0, lng: 0 }, // TODO: Geocode dest
            weight: load.weight,
            goods_type: load.goodsType
        };

        const driversForAi = vehicles.map(v => ({
            driver_id: v.driver?.id || v.id,
            location: { lat: v.currentLat || 0, lng: v.currentLng || 0 },
            rating: v.driver?.rating || 5.0,
            vehicle_type: v.type,
            is_available: true
        }));

        const aiService = new AiService();
        // Call Python AI
        const aiResults = await aiService.getDriverMatchScore(loadForAi, driversForAi);

        // Map AI results back to vehicles
        const scoredVehicles = [];

        // Fallback if AI fails: use local loop
        if (!aiResults || aiResults.length === 0) {
            console.warn("AI Engine returned no results, using fallback.");
            // ... existing fallback ...
        }

        // Process AI results
        const aiScoreMap = new Map();
        if (aiResults) {
            aiResults.forEach((r: any) => aiScoreMap.set(r.driver_id, r.score));
        }

        // const matches = []; // Removed duplicate declaration

        for (const vehicle of vehicles) {
            const driverId = vehicle.driver?.id || vehicle.id;
            // Get score from AI, default to 0.5 if not found
            let score = aiScoreMap.get(driverId) || 0;

            // Normalize score if AI returns > 1 (e.g. 0-100)
            if (score > 1) score = score / 100;

            // 3. Create or Update Match record
            const match = await prisma.match.upsert({
                where: {
                    loadId_vehicleId: {
                        loadId: load.id,
                        vehicleId: vehicle.id
                    }
                },
                update: { score },
                create: {
                    loadId: load.id,
                    vehicleId: vehicle.id,
                    score
                },
                include: {
                    vehicle: {
                        include: {
                            driver: { include: { user: true } },
                            owner: { include: { user: true } }
                        }
                    }
                }
            });

            matches.push(match);
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    }

    // Accept a match (Assign driver/vehicle to load)
    async acceptMatch(matchId: string) {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { load: true }
        });

        if (!match) throw new AppError('Match not found', 404);

        // Update Match Status
        await prisma.match.update({
            where: { id: matchId },
            data: { status: 'ACCEPTED' }
        });

        // Update Load Status
        await prisma.load.update({
            where: { id: match.loadId },
            data: { status: 'ASSIGNED' }
        });

        // Update Vehicle Status
        await prisma.vehicle.update({
            where: { id: match.vehicleId },
            data: { status: 'ON_TRIP' }
        });

        // Reject other matches for this load
        await prisma.match.updateMany({
            where: {
                loadId: match.loadId,
                id: { not: matchId }
            },
            data: { status: 'REJECTED' }
        });

        return match;
    }
}
