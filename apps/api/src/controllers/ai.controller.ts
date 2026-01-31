import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';

const aiService = new AiService();

export const calculateEta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { baseTime, weatherCondition, vehicleType } = req.body;
        const result = await aiService.calculateSmartEta(baseTime, weatherCondition, vehicleType);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const triggerSos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lat, lng } = req.body;
        const result = await aiService.triggerSmartSos(lat, lng);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const matchDrivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { load, drivers } = req.body;
        const result = await aiService.getDriverMatchScore(load, drivers);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
