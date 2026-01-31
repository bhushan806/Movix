import { Request, Response } from 'express';
import { DriverService } from '../services/driver.service';

const driverService = new DriverService();

export const getProfile = async (req: Request, res: Response) => {
    try {
        // Assuming auth middleware adds user to req
        const userId = (req as any).user.id;
        const profile = await driverService.getProfile(userId);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

export const toggleStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const profile = await driverService.toggleStatus(userId);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
export const getAllDrivers = async (req: Request, res: Response) => {
    try {
        const drivers = await driverService.getAllDrivers();
        res.json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

export const getMyDrivers = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user.id;
        const drivers = await driverService.getMyDrivers(ownerId);
        res.json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
