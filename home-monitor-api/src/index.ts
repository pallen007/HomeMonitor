import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import plantsRouter from './routes/plants';
import summaryRouter from './routes/summary';
import sensorRouter from './routes/sensor';
import perenualRouter from './routes/perenual';
import wikipediaRouter from './routes/wikipedia';
import { startPlantEnrichmentWorker } from './services/plant-enrichment';
import { getPerenualApiKey } from './services/perenual-client';

export const app = express();
const PORT = Number(process.env.PORT) || 5000;

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/home-monitor';

async function connectToMongo(): Promise<void> {
    while (true) {
        try {
            await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
            console.log('Connected to MongoDB');
            return;
        } catch (error) {
            console.error('Error connecting to MongoDB; retrying in 2 seconds:', error);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}

if (require.main === module) {
    connectToMongo().then(() => {
        if (getPerenualApiKey()) {
            startPlantEnrichmentWorker();
        } else {
            console.warn('Plant enrichment worker is disabled because Perenual is not configured');
        }
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`API is running on port ${PORT}`);
        });
    });
}

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/plants', plantsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/sensor', sensorRouter);
app.use('/api/perenual', perenualRouter);
app.use('/api/wikipedia', wikipediaRouter);

export default app;