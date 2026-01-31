import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';
import { UserModel } from '../models/mongoose/User';
import { DriverProfileModel } from '../models/mongoose/DriverProfile';
import { OwnerProfileModel } from '../models/mongoose/OwnerProfile';

export class AuthService {
    // Generate Tokens
    private generateTokens(userId: string) {
        const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    // Register User
    async register(data: { email: string; phone: string; password: string; name: string; role: Role }) {
        // Check existing using Mongoose
        const existingUser = await UserModel.findOne({
            $or: [{ email: data.email }, { phone: data.phone }]
        });

        if (existingUser) {
            throw new AppError('Email or Phone already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create User using Mongoose
        const userDoc = await UserModel.create({
            ...data,
            password: hashedPassword
        });

        // Create specific profile based on role
        try {
            if (data.role === 'DRIVER') {
                await DriverProfileModel.create({
                    userId: userDoc._id,
                    licenseNumber: `TEMP-${Date.now()}`,
                    experienceYears: 0,
                    rating: 5.0,
                    totalTrips: 0
                });
            } else if (data.role === 'OWNER') {
                await OwnerProfileModel.create({
                    userId: userDoc._id,
                    companyName: `${userDoc.name}'s Transport`
                });
            }
        } catch (error) {
            console.error('Failed to create profile for user:', userDoc._id, error);
        }

        const tokens = this.generateTokens(userDoc._id.toString());

        // Map Mongoose doc to simple object for return
        const user = {
            id: userDoc._id.toString(),
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
            phone: userDoc.phone,
            avatar: userDoc.avatar
        };

        return { user, ...tokens };
    }

    // Login User
    async login(data: { email: string; password: string }) {
        const user = await prisma.user.findUnique({ where: { email: data.email } });

        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new AppError('Invalid email or password', 401);
        }

        const tokens = this.generateTokens(user.id);
        return { user, ...tokens };
    }

    // Refresh Token
    async refreshToken(token: string) {
        try {
            const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
            const user = await prisma.user.findUnique({ where: { id: payload.id } });
            if (!user) throw new AppError('User not found', 401);

            const tokens = this.generateTokens(user.id);
            return tokens;
        } catch (error) {
            throw new AppError('Invalid refresh token', 401);
        }
    }

    async getDrivers() {
        return prisma.driverProfile.findMany({
            where: { isAvailable: true },
            include: {
                user: {
                    select: { name: true, email: true, phone: true, avatar: true }
                }
            }
        });
    }
    async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('User not found', 404);

        // Generate a reset token (valid for 1 hour)
        const resetToken = jwt.sign({ userId: user.id, type: 'reset' }, env.JWT_SECRET, { expiresIn: '1h' });

        // In a real app, send this via email
        // For prototype, we'll return it
        return { message: 'Password reset link sent', resetToken };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as any;
            if (payload.type !== 'reset') throw new Error('Invalid token type');

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: payload.userId },
                data: { password: hashedPassword }
            });

            return { message: 'Password updated successfully' };
        } catch (error) {
            throw new AppError('Invalid or expired reset token', 400);
        }
    }
}
