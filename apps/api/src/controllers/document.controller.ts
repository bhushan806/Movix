import { Request, Response } from 'express';
import DocumentModel from '../models/Document';

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const docs = await DocumentModel.find({ owner: req.user?.id }).sort({ createdAt: -1 });
        res.json({ status: 'success', data: docs });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { title, type, expiryDate, entityId } = req.body;

        let fileUrl = '';
        if (req.file) {
            // Convert file path to URL accessible by frontend
            // Assuming static serve at /uploads
            fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const newDoc = await DocumentModel.create({
            owner: req.user?.id,
            title,
            type,
            entityId,
            url: fileUrl || 'https://via.placeholder.com/150', // Fallback if no file
            expiryDate,
            status: 'valid'
        });

        res.status(201).json({ status: 'success', data: newDoc });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};
