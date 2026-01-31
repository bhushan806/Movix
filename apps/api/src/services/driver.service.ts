import { PrismaClient } from '@prisma/client';
import { DriverProfileModel } from '../models/mongoose/DriverProfile';
import { ConnectionRequestModel } from '../models/mongoose/ConnectionRequest';
import { VehicleModel } from '../models/mongoose/Vehicle';

const prisma = new PrismaClient();

export class DriverService {
    // ... existing methods ...

    async getMyDrivers(ownerId: string) {
        try {
            // 1. Find accepted connections
            const connections = await ConnectionRequestModel.find({
                ownerId,
                status: 'ACCEPTED'
            });

            const driverIds = connections.map(c => c.driverId);

            // 2. Fetch driver profiles with user details
            // We use Mongoose to get the 'documents' field
            const drivers = await DriverProfileModel.find({
                _id: { $in: driverIds }
            }).populate('userId', 'name email phone avatar');

            // 3. Fetch assigned vehicles
            const vehicles = await VehicleModel.find({
                driverId: { $in: driverIds }
            });

            // 4. Merge and format
            return drivers.map(driver => {
                const vehicle = vehicles.find(v => v.driverId?.toString() === driver._id.toString());
                return {
                    ...driver.toObject(),
                    user: driver.userId, // populated user details
                    vehicle: vehicle || null
                };
            });
        } catch (error) {
            console.error('Error in getMyDrivers:', error);
            throw error;
        }
    }

    async getProfile(userId: string) {
        // ... existing getProfile code ...
        try {
            let profile = await prisma.driverProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                    vehicles: true,
                },
            });

            if (!profile) {
                // Auto-create profile for existing users using Mongoose
                const newProfile = await DriverProfileModel.create({
                    userId,
                    licenseNumber: `PENDING-${Date.now()}`,
                    experienceYears: 0,
                    rating: 5.0,
                    totalTrips: 0
                });

                // Fetch it back with Prisma to get the relations and consistent format
                profile = await prisma.driverProfile.findUnique({
                    where: { id: newProfile._id.toString() },
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                        vehicles: true,
                    },
                });
            }

            if (!profile) throw new Error('Failed to create/fetch profile');

            // Map vehicles array to single vehicle for frontend compatibility
            return {
                ...profile,
                vehicle: profile.vehicles[0] || null
            };
        } catch (error) {
            console.error('Error in DriverService.getProfile:', error);
            throw error;
        }
    }

    async toggleStatus(userId: string) {
        const profile = await prisma.driverProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new Error('Driver profile not found');
        }

        const newStatus = !profile.isAvailable;

        // Use Mongoose for update
        await DriverProfileModel.findOneAndUpdate(
            { userId },
            { isAvailable: newStatus }
        );

        // Return updated profile
        return { ...profile, isAvailable: newStatus };
    }

    async getAllDrivers() {
        // In a real app, we would filter by ownerId if drivers are assigned to specific owners
        // For now, return all drivers
        const drivers = await prisma.driverProfile.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    },
                },
                vehicles: true,
            },
        });

        return drivers.map(d => ({
            ...d,
            vehicle: d.vehicles[0] || null
        }));
    }
}
