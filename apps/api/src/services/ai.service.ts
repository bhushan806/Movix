import axios from 'axios';
import { env } from '../config/env';

// Base URL for AI Engine
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export interface AiContext {
    current_location?: string;
    destination?: string;
    current_earnings?: number;
    idle_truck_count?: number;
    active_shipments?: number;
    [key: string]: any;
}

export class AiService {
    /**
     * Fetches role-based insights from the Python AI Engine.
     */
    async getInsights(role: string, userId: string, context: AiContext) {
        try {
            console.log(`[AiService] Fetching insights for ${role} (${userId})...`);

            const payload = {
                role: role,
                user_id: userId,
                context: context
            };

            const response = await axios.post(`${AI_ENGINE_URL}/get-insights`, payload);
            return response.data;
        } catch (error) {
            console.error('[AiService] Error fetching insights:', error);
            // Return fallback/empty response to prevent UI crash
            return {
                summary: "AI Service Temporarily Unavailable",
                top_recommendations: [],
                insights: [],
                confidence_score: 0.0,
                explanation: "Connection to AI Engine failed."
            };
        }
    }
}
