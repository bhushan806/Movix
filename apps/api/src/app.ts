import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

// Import Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import rideRoutes from './routes/ride.routes';
import loadRoutes from './routes/load.routes';
import matchRoutes from './routes/match.routes';
import roadsideRoutes from './routes/roadside.routes';
import driverRoutes from './routes/driver.routes';
import aiRoutes from './routes/ai.routes';
import assistantRoutes from './routes/assistant.routes';
import requestRoutes from './routes/request.routes';
import financeRoutes from './routes/finance.routes';
import documentRoutes from './routes/document.routes';

import { connectMongoose } from './config/mongoose';

// Connect Mongoose
connectMongoose();

import { initSocket } from './config/socket';

// ... imports

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve Static Uploads
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ... imports


// ...

app.use('/api/auth', authRoutes);

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/roadside', roadsideRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/documents', documentRoutes);

// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} `);
});
