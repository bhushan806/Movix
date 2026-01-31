import mongoose from 'mongoose';
import { env } from './env';

export const connectMongoose = async () => {
    try {
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Mongoose Connected');
    } catch (error) {
        console.error('❌ Mongoose Connection Error:', error);
        process.exit(1);
    }
};
