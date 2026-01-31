import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';



export class LoadService {
    async createLoad(data: any, userId: string) {
        const ownerProfile = await prisma.ownerProfile.findUnique({
            where: { userId }
        });

        if (!ownerProfile) {
            throw new AppError('Owner profile not found', 404);
        }

        const load = await prisma.load.create({
            data: {
                ...data,
                ownerId: ownerProfile.id
            }
        });

        return load;
    }

    async getLoads(userId: string) {
        const ownerProfile = await prisma.ownerProfile.findUnique({
            where: { userId }
        });

        if (!ownerProfile) {
            throw new AppError('Owner profile not found', 404);
        }

        return prisma.load.findMany({
            where: { ownerId: ownerProfile.id },
            orderBy: { createdAt: 'desc' }
        });
    }
}
