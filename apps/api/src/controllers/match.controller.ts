import { Request, Response, NextFunction } from 'express';
import { MatchService } from '../services/match.service';

const matchService = new MatchService();

export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { loadId } = req.params;
        const matches = await matchService.findMatches(loadId);
        res.status(200).json({ status: 'success', data: matches });
    } catch (error) {
        next(error);
    }
};

export const acceptMatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { matchId } = req.params;
        const match = await matchService.acceptMatch(matchId);
        res.status(200).json({ status: 'success', data: match });
    } catch (error) {
        next(error);
    }
};
