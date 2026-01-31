import prisma from '../config/prisma';
import axios from 'axios';
import { env } from '../config/env';
import { MatchService } from './match.service';
import { RoadsideService } from './roadside.service';

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
                    // Call AI Engine for Smart Matching
                    try {
                        // Mock data for demo - in real app, fetch from DB
                        const mockLoad = {
                            load_id: "L123",
                            origin: { lat: 18.5204, lng: 73.8567 }, // Pune
                            destination: { lat: 19.0760, lng: 72.8777 }, // Mumbai
                            weight: 10.5,
                            goods_type: "Electronics"
                        };

                        const mockDrivers = [
                            { driver_id: "D1", location: { lat: 18.5200, lng: 73.8500 }, rating: 4.8, vehicle_type: "Truck", is_available: true },
                            { driver_id: "D2", location: { lat: 18.6000, lng: 73.8000 }, rating: 4.5, vehicle_type: "Truck", is_available: true },
                            { driver_id: "D3", location: { lat: 19.0000, lng: 73.0000 }, rating: 4.2, vehicle_type: "Van", is_available: true }
                        ];

                        const aiResponse = await axios.post('http://localhost:8000/match', {
                            load: mockLoad,
                            available_drivers: mockDrivers
                        });

                        const matches = aiResponse.data;
                        response = `I found ${matches.length} smart matches for your load! Top match score: ${matches[0]?.score}`;
                        data = matches;
                        action = 'SHOW_LOADS';
                    } catch (e) {
                        console.error("AI Engine Error:", e);
                        // Fallback to local DB if AI fails
                        const loads = await prisma.load.findMany({
                            where: { status: 'OPEN' },
                            take: 5
                        });
                        response = `AI Engine is offline, but I found ${loads.length} available loads from the database.`;
                        data = loads;
                        action = 'SHOW_LOADS';
                    }
                    break;

                case 'PRICE_CHECK':
                    try {
                        // Extract city from message or default
                        const originCity = message.includes('Mumbai') ? 'Mumbai' : 'Pune';

                        const priceReq = {
                            distance_km: 150, // Mock distance
                            weight: 10,
                            vehicle_type: "Truck",
                            origin_city: originCity
                        };

                        const priceRes = await axios.post('http://localhost:8000/predict-price', priceReq);
                        const priceData = priceRes.data;

                        response = `Estimated price: ₹${priceData.total_price} (Base: ₹${priceData.base_fare}, Surge: ${priceData.surge_multiplier}x)`;
                        data = priceData;
                    } catch (e) {
                        response = "I couldn't calculate the dynamic price right now.";
                    }
                    break;

                case 'TRACK_VEHICLE':
                    // Mock: Get user's vehicles
                    const vehicles = await prisma.vehicle.findMany({
                        where: { owner: { userId } }
                    });
                    if (vehicles.length > 0) {
                        response = `Your vehicle ${vehicles[0].number} is currently at ${vehicles[0].currentLat}, ${vehicles[0].currentLng}.`;
                        data = vehicles;
                        action = 'SHOW_MAP';
                    } else {
                        response = "You don't have any vehicles registered.";
                    }
                    break;

                case 'ROADSIDE_HELP':
                    response = "I'm starting the roadside assistance protocol. Please describe your issue.";
                    action = 'NAVIGATE_ROADSIDE';
                    break;

                case 'OPTIMIZE_ROUTE':
                    // Mock: Route optimization
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
                    break;
            }
        } catch (error) {
            console.error('AI Processing Error:', error);
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


    async askGemini(message: string, role: string) {
        // Feature 1, 2, 3: Replaced with Internal Heuristic AI.
        // Google Gemini integration has been removed as per strict architectural requirements.
        return { reply: "I am running on internal logic now. Gemini AI has been disabled." };
    }
}

