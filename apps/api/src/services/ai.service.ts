import axios from 'axios';
import { AppError } from '../utils/AppError';
import { AILoggerService } from './ai-logger.service';

const AI_ENGINE_URL = 'http://localhost:8000';
const aiLogger = new AILoggerService();

export class AiService {

    async calculateSmartEta(baseTime: number, weatherCondition: string, vehicleType: string, tripId?: string) {
        try {
            const inputs = { base_time: baseTime, weather_condition: weatherCondition, vehicle_type: vehicleType };
            const response = await axios.post(`${AI_ENGINE_URL}/predict-eta`, inputs);

            // LOGGING
            await aiLogger.logPrediction(
                "ETA",
                inputs,
                response.data,
                "v1.0",
                tripId
            );

            return response.data;
        } catch (error) {
            console.error('AI Engine Error (ETA):', error);
            // Fallback logic could go here
            return { adjusted_eta: baseTime, details: "AI Unavailable" };
        }
    }

    async triggerSmartSos(lat: number, lng: number, driverId?: string) {
        try {
            const inputs = { lat, lng };
            const response = await axios.post(`${AI_ENGINE_URL}/trigger-sos`, inputs);

            // LOGGING
            await aiLogger.logPrediction(
                "SOS",
                inputs,
                response.data,
                "v1.0",
                undefined,
                driverId
            );

            return response.data;
        } catch (error) {
            console.error('AI Engine Error (SOS):', error);
            throw new AppError('Failed to trigger Smart SOS', 500);
        }
    }

    async getDriverMatchScore(load: any, drivers: any[]) {
        try {
            const response = await axios.post(`${AI_ENGINE_URL}/match`, {
                load,
                available_drivers: drivers
            });

            // LOGGING (Log top match or all?)
            // We log the *Batch* or individual? 
            // Let's log the top result for now to save space, or maybe the decision process.
            // Ideally we log ONE entry per "Match Request" with details?
            // "PredictionLog" is designed for single prediction? 
            // Let's iterate and log for the top 5 candidates.

            const results = response.data;
            if (Array.isArray(results)) {
                // Log top 3
                for (const res of results.slice(0, 3)) {
                    await aiLogger.logPrediction(
                        "MATCHING",
                        { loadId: load.id, driverId: res.driver_id, distance: res.distance_km },
                        { score: res.score },
                        "v1.0",
                        load.id,
                        res.driver_id,
                        res.score
                    );
                }
            }

            return response.data;
        } catch (error) {
            console.error('AI Engine Error (Matching):', error);
            // Fallback to empty list or basic sorting?
            return [];
        }
    }
}
