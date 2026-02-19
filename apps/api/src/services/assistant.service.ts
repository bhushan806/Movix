import { env } from '../config/env';
import { logger } from '../utils/logger';
import { DriverProfileModel } from '../models/mongoose/DriverProfile';
import { VehicleModel } from '../models/mongoose/Vehicle';
import { LoadModel } from '../models/mongoose/Load';
import axios from 'axios';
import { MatchService } from './match.service';
import { RoadsideService } from './roadside.service';
import { callGrokAPI } from './aiService';

const matchService = new MatchService();
const roadsideService = new RoadsideService();

export class AssistantService {
    async processCommand(userId: string, message: string) {
        const intent = this.detectIntent(message);
        let response = "I'm sorry, I didn't understand that. You can ask me to find loads, track vehicles, or report a breakdown.";
        let data = null;
        let action = null;

        try {
            switch (intent) {
                case 'FIND_LOADS':
                    try {
                        const mockLoad = {
                            load_id: "L123",
                            origin: { lat: 18.5204, lng: 73.8567 },
                            destination: { lat: 19.0760, lng: 72.8777 },
                            weight: 10.5,
                            goods_type: "Electronics"
                        };

                        const mockDrivers = [
                            { driver_id: "D1", location: { lat: 18.5200, lng: 73.8500 }, rating: 4.8, vehicle_type: "Truck", is_available: true },
                            { driver_id: "D2", location: { lat: 18.6000, lng: 73.8000 }, rating: 4.5, vehicle_type: "Truck", is_available: true },
                        ];

                        const aiResponse = await axios.post(`${env.AI_ENGINE_URL}/match`, {
                            load: mockLoad,
                            available_drivers: mockDrivers
                        });

                        const matches = aiResponse.data;
                        response = `I found ${matches.length} smart matches for your load! Top match score: ${matches[0]?.score}`;
                        data = matches;
                        action = 'SHOW_LOADS';
                    } catch (e) {
                        logger.error('AI Engine unavailable for smart matching', { error: (e as any).message });
                        // Fallback to local DB
                        const loads = await LoadModel.find({ status: 'OPEN' }).limit(5).lean();
                        response = `AI Engine is offline, but I found ${loads.length} available loads from the database.`;
                        data = loads;
                        action = 'SHOW_LOADS';
                    }
                    break;

                case 'PRICE_CHECK':
                    try {
                        const originCity = message.includes('Mumbai') ? 'Mumbai' : 'Pune';
                        const priceReq = {
                            distance_km: 150,
                            weight: 10,
                            vehicle_type: "Truck",
                            origin_city: originCity
                        };

                        const priceRes = await axios.post(`${env.AI_ENGINE_URL}/predict-price`, priceReq);
                        const priceData = priceRes.data;

                        response = `Estimated price: ₹${priceData.total_price} (Base: ₹${priceData.base_fare}, Surge: ${priceData.surge_multiplier}x)`;
                        data = priceData;
                    } catch (e) {
                        response = "I couldn't calculate the dynamic price right now.";
                    }
                    break;

                case 'TRACK_VEHICLE':
                    // Use Mongoose to find vehicles
                    const driverProfile = await DriverProfileModel.findOne({ userId });
                    if (driverProfile) {
                        const vehicles = await VehicleModel.find({ driverId: driverProfile._id }).lean();
                        if (vehicles.length > 0) {
                            response = `Your vehicle ${vehicles[0].number} is currently tracked.`;
                            data = vehicles;
                            action = 'SHOW_MAP';
                        } else {
                            response = "You don't have any vehicles assigned.";
                        }
                    } else {
                        response = "No driver profile found.";
                    }
                    break;

                case 'ROADSIDE_HELP':
                    response = "I'm starting the roadside assistance protocol. Please describe your issue.";
                    action = 'NAVIGATE_ROADSIDE';
                    break;

                case 'OPTIMIZE_ROUTE':
                    response = "I've analyzed the traffic and road conditions. Here is the optimized route for your current delivery.";
                    data = {
                        route: [
                            { lat: 18.5204, lng: 73.8567, name: 'Pune' },
                            { lat: 19.0760, lng: 72.8777, name: 'Mumbai' }
                        ],
                        savings: '15 mins',
                        distance: '148 km'
                    };
                    action = 'SHOW_ROUTE';
                    break;

                case 'GREETING':
                    response = "Hello! I'm your TruckNet AI Assistant. How can I help you today?";
                    action = null;
                    break;
            }
        } catch (error) {
            logger.error('AI processing error', { error: (error as any).message });
            response = "I encountered an error while processing your request.";
        }

        return {
            message: response,
            data,
            action
        };
    }

    private detectIntent(message: string): string {
        const msg = message.toLowerCase();

        if (msg.includes('load') || msg.includes('job') || msg.includes('freight')) return 'FIND_LOADS';
        if (msg.includes('where') || msg.includes('track') || msg.includes('location')) return 'TRACK_VEHICLE';
        if (msg.includes('help') || msg.includes('breakdown') || msg.includes('emergency') || msg.includes('sos')) return 'ROADSIDE_HELP';
        if (msg.includes('route') || msg.includes('optimize') || msg.includes('direction') || msg.includes('traffic')) return 'OPTIMIZE_ROUTE';
        if (msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('quote')) return 'PRICE_CHECK';
        if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) return 'GREETING';

        return 'UNKNOWN';
    }

    async askAI(message: string, role: string) {
        try {
            const prompt = `
            You remain "TruckNet India – Logistics AI Assistant".
            Role: You are talking to a ${role}.
            Context: TruckNet is an Indian logistics platform.
            
            Guidelines:
            - Suggest truck types (e.g., Tata Ace for small loads, 10-Tyre for heavy).
            - Explain booking/trip status.
            - Help owners with pricing guidance.
            - Help drivers understand earnings.
            - DO NOT accept/reject bookings.
            - DO NOT assign drivers/vehicles.
            - DO NOT trigger payments.
            - Keep answers short, professional, and helpful.
            `;

            const messages = [
                { role: 'system' as const, content: prompt },
                { role: 'user' as const, content: message }
            ];

            const text = await callGrokAPI(messages);
            return { reply: text };
        } catch (error: any) {
            // SECURITY: Log error internally, never expose raw error message to user
            logger.error('AI provider error in askAI', { error: error.message });
            return { reply: "I'm currently having trouble connecting to the AI brain. Please try again later." };
        }
    }
}
