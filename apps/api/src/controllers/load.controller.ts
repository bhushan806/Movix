import { Request, Response, NextFunction } from 'express';
import { LoadService } from '../services/load.service';

const loadService = new LoadService();

export const createLoad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const result = await loadService.createLoad(req.body, userId);
        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

export const getLoads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const result = await loadService.getLoads(userId);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};
