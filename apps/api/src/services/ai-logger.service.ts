import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AILoggerService {

    /**
     * Log a prediction made by the AI (or heuristic)
     */
    async logPrediction(
        service: string,
        inputs: any,
        predictedValue: any,
        modelVersion: string = "v1.0",
        rideId?: string,
        driverId?: string,
        confidence?: number
    ) {
        try {
            await prisma.predictionLog.create({
                data: {
                    service,
                    inputs,
                    predictedValue,
                    modelVersion,
                    rideId,
                    driverId,
                    confidence
                }
            });
            console.log(`[AI-Log] Prediction logged for ${service}`);
        } catch (error) {
            console.error(`[AI-Log-Error] Failed to log prediction:`, error);
        }
    }

    /**
     * Log a training example (Actual outcome)
     * This is the "Ground Truth" for future training
     */
    async logTrainingData(
        service: string,
        features: any,
        label: any,
        sourceId?: string
    ) {
        try {
            await prisma.trainingData.create({
                data: {
                    service,
                    features,
                    label,
                    sourceId
                }
            });
            console.log(`[AI-Log] Training Data logged for ${service}`);
        } catch (error) {
            console.error(`[AI-Log-Error] Failed to log training data:`, error);
        }
    }
}
