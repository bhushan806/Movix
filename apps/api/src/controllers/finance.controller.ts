import { Request, Response } from 'express';
import Transaction from '../models/Transaction';

// Get Summary Stats & Transactions
export const getFinanceOverview = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id; // Assuming auth middleware adds user

        const transactions = await Transaction.find({ owner: userId }).sort({ date: -1 });

        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netProfit = totalRevenue - totalExpenses;

        res.json({
            status: 'success',
            data: {
                summary: {
                    totalRevenue,
                    totalExpenses,
                    netProfit
                },
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// Add Transaction (Manual Entry)
export const addTransaction = async (req: Request, res: Response) => {
    try {
        const { description, amount, type, category, date } = req.body;
        const width = req.user?.id;

        const newTx = await Transaction.create({
            owner: req.user?.id,
            description,
            amount,
            type,
            category,
            date: date || new Date()
        });

        res.status(201).json({ status: 'success', data: newTx });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};
