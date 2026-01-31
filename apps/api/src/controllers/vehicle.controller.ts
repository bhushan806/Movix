import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';

const vehicleService = new VehicleService();

const createVehicleSchema = z.object({
    number: z.string(),
    type: z.string(),
    capacity: z.number(),
});

export const createVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
            throw new AppError('Only owners can add vehicles', 403);
        }

        const data = createVehicleSchema.parse(req.body);

        // Find Owner Profile
        const ownerProfile = await prisma.ownerProfile.findUnique({
            where: { userId: req.user.id }
        });

        if (!ownerProfile) {
            throw new AppError('Owner profile not found. Please complete your profile.', 404);
        }

        const result = await vehicleService.createVehicle({
            ...data,
            ownerId: ownerProfile.id
        });

        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await vehicleService.getVehicles(req.query as any);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await vehicleService.updateVehicle(id, req.body);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};
