import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';
import prisma from '../config/prisma';

const aiService = new AiService();

export const getInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { role, userId } = req.body;

        if (!role || !userId) {
            res.status(400).json({ error: "Role and User ID are required" });
            return;
        }

        console.log(`[AI] Processing request for ${role} - ${userId}`);

        // 1. Identify User (ID or Email) + Auto-Seed Demo
        let user = null;
        if (userId.includes('@')) {
            user = await prisma.user.findUnique({ where: { email: userId } });

            // SELF-SEEDING for Demo
            if (!user && userId.includes('trucknet.in')) {
                console.log(`[AI] Auto-Seeding Demo User: ${userId}`);
                try {
                    user = await prisma.user.create({
                        data: {
                            email: userId,
                            phone: `99${Math.floor(Math.random() * 90000000 + 10000000)}`,
                            password: 'demo',
                            name: role === 'OWNER' ? 'Demo Owner' : 'Demo Driver',
                            role: role === 'OWNER' ? 'OWNER' : 'DRIVER'
                        }
                    });

                    if (role === 'OWNER') {
                        const profile = await prisma.ownerProfile.create({
                            data: { userId: user.id, companyName: 'Demo Logistics Pvt Ltd' }
                        });
                        // Create Demo Fleet
                        await prisma.vehicle.createMany({
                            data: [
                                { number: 'MH-12-DEMO-01', type: 'TRUCK_LARGE', status: 'AVAILABLE', ownerId: profile.id, capacity: 20 },
                                { number: 'MH-14-DEMO-02', type: 'TRUCK_SMALL', status: 'MAINTENANCE', ownerId: profile.id, capacity: 8 },
                                { number: 'MH-04-LIVE-03', type: 'CONTAINER', status: 'ON_TRIP', ownerId: profile.id, capacity: 15 }
                            ]
                        });
                    } else if (role === 'DRIVER') {
                        await prisma.driverProfile.create({
                            data: {
                                userId: user.id,
                                licenseNumber: `DL-${Math.floor(Math.random() * 100000)}`,
                                experienceYears: 5,
                                rating: 4.8,
                                totalTrips: 55, // High trips -> Maintenance alert
                                currentLat: 19.0760,
                                currentLng: 72.8777
                            }
                        });
                    }
                } catch (e) {
                    console.log("[AI] Seeding Warning (Concurrent?):", e);
                    // Retry fetch if create failed due to race condition
                    user = await prisma.user.findUnique({ where: { email: userId } });
                }
            }
        } else {
            user = await prisma.user.findUnique({ where: { id: userId } });
        }

        // Use the Resolved Real ID -> Logic: If user found, use ID. Else keep input.
        const dbUserId = user ? user.id : userId;
        console.log(`[AI] Resolved DB User ID: ${dbUserId}`);

        // Helper to check valid Mongo ID
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

        // 2. Gather Context based on Role (from DB or Fallback)
        let context: any = {};

        if (role === 'DRIVER') {
            let driverProfile = null;
            if (isValidObjectId(dbUserId)) {
                try {
                    driverProfile = await prisma.driverProfile.findUnique({
                        where: { userId: dbUserId },
                        include: { rides: { where: { status: 'ONGOING' } } }
                    });
                } catch (e) { console.error("Driver Profile Fetch Error", e); }
            }

            if (driverProfile) {
                // Real DB Data
                context = {
                    driver_id: driverProfile.id,
                    rating: driverProfile.rating,
                    total_trips: driverProfile.totalTrips,
                    // If on a ride, send destination for routing
                    current_location: driverProfile.currentLat ? { lat: driverProfile.currentLat, lng: driverProfile.currentLng } : "Mumbai",
                    destination: driverProfile.rides[0]?.destination || "Pune",
                    current_earnings: 12000
                };
            } else {
                // Fallback for Demo 
                context = { current_location: "Mumbai", destination: "Pune", current_earnings: 4500 };
            }

        } else if (role === 'OWNER') {
            let ownerProfile = null;
            if (isValidObjectId(dbUserId)) {
                try {
                    ownerProfile = await prisma.ownerProfile.findUnique({ where: { userId: dbUserId } });
                } catch (e) { console.error("Owner Profile Fetch Error", e); }
            }

            if (ownerProfile) {
                const vehicles = await prisma.vehicle.findMany({ where: { ownerId: ownerProfile.id } });
                const idleCount = vehicles.filter(v => v.status === 'AVAILABLE').length;
                const maintenanceCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;

                context = {
                    idle_truck_count: idleCount,
                    maintenance_count: maintenanceCount,
                    total_fleet_size: vehicles.length,
                    top_performing_vehicle: vehicles[0]?.number || "NA"
                };
            } else {
                context = { idle_truck_count: 2, maintenance_count: 1 };
            }

        } else if (role === 'CUSTOMER') {
            let rides: any[] = [];
            if (isValidObjectId(dbUserId)) {
                try {
                    rides = await prisma.ride.findMany({
                        where: { customerId: dbUserId, status: { in: ['ASSIGNED', 'ONGOING'] } }
                    });
                } catch (e) { console.error("Customer Rides Fetch Error", e); }
            }

            context = {
                active_shipments: rides.length,
                latest_shipment_status: rides[0]?.status || "NO_ACTIVE_SHIPMENTS"
            };
        }

        // 3. Call AI Service
        const insights = await aiService.getInsights(role, dbUserId, context);

        res.status(200).json({ status: 'success', data: insights });
    } catch (error: any) {
        console.error("[AI Controller Error]", error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            details: error.message,
            stack: error.stack
        });
    }
};

export const seedData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Seeding Real AI Data via API...');

        // 1. Create a Demo Owner with Fleet
        const ownerEmail = 'demo.owner@trucknet.in';
        let ownerUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
        let newOwner = false;

        if (!ownerUser) {
            newOwner = true;
            ownerUser = await prisma.user.create({
                data: {
                    email: ownerEmail,
                    phone: '9876543210',
                    password: 'password123',
                    name: 'Rajesh Transports',
                    role: 'OWNER',
                    ownerProfile: {
                        create: {
                            companyName: 'Rajesh Transports Pvt Ltd'
                        }
                    }
                }
            });
        }

        const ownerProfile = await prisma.ownerProfile.findUnique({ where: { userId: ownerUser.id } });

        if (ownerProfile && newOwner) {
            // Create Fleet only if new owner
            await prisma.vehicle.createMany({
                data: [
                    { number: 'MH-12-AB-1234', type: 'TRUCK_10T', status: 'AVAILABLE', ownerId: ownerProfile.id, capacity: 10 },
                    { number: 'MH-14-XY-9876', type: 'TRUCK_10T', status: 'MAINTENANCE', ownerId: ownerProfile.id, capacity: 10 },
                    { number: 'MH-04-JK-5555', type: 'TRUCK_20T', status: 'ON_TRIP', ownerId: ownerProfile.id, capacity: 20 }
                ]
            });
        }

        // 2. Create a Demo Driver
        const driverEmail = 'demo.driver@trucknet.in';
        let driverUser = await prisma.user.findUnique({ where: { email: driverEmail } });

        if (!driverUser) {
            driverUser = await prisma.user.create({
                data: {
                    email: driverEmail,
                    phone: '9988776655',
                    password: 'password123',
                    name: 'Suresh Driver',
                    role: 'DRIVER',
                    driverProfile: {
                        create: {
                            licenseNumber: 'MH-12-20220000123',
                            experienceYears: 10,
                            rating: 4.8,
                            totalTrips: 60,
                            currentLat: 19.0760,
                            currentLng: 72.8777
                        }
                    }
                }
            });
        }

        res.json({
            status: 'success',
            message: 'Database Seeded',
            data: {
                ownerId: ownerUser ? ownerUser.id : "",
                driverId: driverUser ? driverUser.id : ""
            }
        });
    } catch (e) {
        next(e);
    }
};
