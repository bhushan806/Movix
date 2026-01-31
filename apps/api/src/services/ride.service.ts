import prisma from '../config/prisma';
import { RideStatus } from '@prisma/client';
import { RideModel } from '../models/mongoose/Ride';

export class RideService {
    async getEstimate(distance: number, vehicleType: string, source: string = 'Mumbai') {
        try {
            // Try calling AI Engine
            const axios = require('axios');
            const aiResponse = await axios.post('http://localhost:8000/predict-price', {
                distance_km: distance,
                weight: 10, // Default weight for now
                vehicle_type: vehicleType,
                origin_city: source.split(',')[0].trim() || 'Mumbai'
            });

            return {
                price: aiResponse.data.total_price,
                distance,
                rate: aiResponse.data.breakdown.rate_per_km,
                surge: aiResponse.data.surge_multiplier,
                isAiEstimate: true
            };
        } catch (error) {
            console.warn('AI Engine unavailable, using fallback pricing:', (error as Error).message);
            // Fallback: Simple logic
            let rate = 20; // Default per km
            if (vehicleType === 'Truck') rate = 50;
            if (vehicleType === 'Container') rate = 80;

            const price = 500 + (distance * rate); // Base 500
            return { price, distance, rate, isAiEstimate: false };
        }
    }

    async createBooking(data: {
        customerId: string;
        source: string;
        destination: string;
        distance: number;
        price: number;
        pickupLat: number;
        pickupLng: number;
        dropLat: number;
        dropLng: number;
        vehicleType: string;
    }) {
        const ride = await RideModel.create({
            customerId: data.customerId,
            source: data.source,
            destination: data.destination,
            distance: data.distance,
            price: data.price,
            pickupLat: data.pickupLat,
            pickupLng: data.pickupLng,
            dropLat: data.dropLat,
            dropLng: data.dropLng,
            status: 'PENDING'
        });

        return {
            id: ride._id.toString(),
            ...data,
            status: 'PENDING',
            createdAt: ride.createdAt,
            updatedAt: ride.updatedAt
        };
    }

    async assignDriver(rideId: string, driverId: string) {
        return RideModel.findByIdAndUpdate(
            rideId,
            {
                driverId,
                status: 'ASSIGNED'
            },
            { new: true }
        );
    }

    async getDriverTasks(driverId: string) {
        return RideModel.find({
            driverId,
            status: 'ASSIGNED'
        }).sort({ createdAt: -1 });
    }

    async acceptRide(rideId: string, driverId: string) {
        // Check if ride is pending or assigned
        const ride = await RideModel.findById(rideId);
        if (!ride || (ride.status !== 'PENDING' && ride.status !== 'ASSIGNED')) {
            throw new Error('Ride not available');
        }

        // Assign driver using Mongoose
        const updatedRide = await RideModel.findByIdAndUpdate(
            rideId,
            {
                driverId,
                status: 'ACCEPTED',
                startTime: new Date()
            },
            { new: true }
        ).populate('customerId');

        return updatedRide;
    }

    async updateStatus(rideId: string, status: RideStatus) {
        return RideModel.findByIdAndUpdate(
            rideId,
            { status },
            { new: true }
        );
    }

    async getAvailableRides() {
        return RideModel.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    }

    async getCustomerRides(customerId: string) {
        return RideModel.find({ customerId }).sort({ createdAt: -1 }).populate('driverId').populate('vehicleId');
    }
}
