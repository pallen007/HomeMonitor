import mongoose, { Schema, Document } from 'mongoose';

export interface IPlant extends Document {
    id: number;
    perenualId?: number;
    nickName?: string;
    userId: string;
    wikipediaSource?: {
        pageId: number;
        title: string;
        articleUrl: string;
        summary: string;
        textLicense: string;
        textLicenseUrl: string;
        imageUrl?: string;
        imageSourceUrl?: string;
        imageAttribution?: string;
        imageLicense?: string;
        imageLicenseUrl?: string;
    };
    enrichment?: {
        status: 'pending' | 'processing' | 'needs_user_action' | 'completed';
        searchTerm: string;
        nextRunAt?: Date;
        selectedPerenualId?: number;
        candidates?: Array<{
            id: number;
            common_name?: string;
            scientific_name?: string[];
            other_name?: string[];
            score: number;
        }>;
        message?: string;
        lastError?: string;
        enrichedAt?: Date;
    };
    wateringSchedule?: {
        frequency: number;
        lastWatered: Date;
        nextWatering: Date;
    };
    moistureLevel?: number;
    idealMoistureLevel?: number;
    sunlightExposure?: string;
    temperature?: number;
    plantDetails?: {
        common_name: string;
        scientific_name?: string[];
        other_name?: string[];
        cycle?: string;
        watering?: string;
        sunlight?: string[];
        soil?: string[];
        description?: string;
        hardiness?: { min?: string; max?: string };
        watering_general_benchmark?: { value?: string; unit?: string };
        poisonous_to_humans?: boolean;
        poisonous_to_pets?: boolean;
        perenualId?: number;
        enrichmentSource?: string;
        enrichedAt?: Date;
        default_image?: {
            thumbnail: string;
            regular_url: string;
        };
    };
}

const PlantSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    perenualId: { type: Number },
    nickName: { type: String },
    userId: { type: String, required: true },
    wikipediaSource: {
        pageId: { type: Number, required: true },
        title: { type: String, required: true },
        articleUrl: { type: String, required: true },
        summary: { type: String, required: true },
        textLicense: { type: String, required: true },
        textLicenseUrl: { type: String, required: true },
        imageUrl: { type: String },
        imageSourceUrl: { type: String },
        imageAttribution: { type: String },
        imageLicense: { type: String },
        imageLicenseUrl: { type: String },
    },
    enrichment: {
        status: { type: String, enum: ['pending', 'processing', 'needs_user_action', 'completed'] },
        searchTerm: { type: String },
        nextRunAt: { type: Date },
        selectedPerenualId: { type: Number },
        candidates: [{
            id: { type: Number, required: true },
            common_name: { type: String },
            scientific_name: [{ type: String }],
            other_name: [{ type: String }],
            score: { type: Number, required: true },
        }],
        message: { type: String },
        lastError: { type: String },
        enrichedAt: { type: Date },
    },
    wateringSchedule: {
        frequency: { type: Number },
        lastWatered: { type: Date },
        nextWatering: { type: Date }
    },
    moistureLevel: { type: Number },
    idealMoistureLevel: { type: Number },
    sunlightExposure: { type: String },
    temperature: { type: Number },
    plantDetails: {
        common_name: { type: String },
        scientific_name: [{ type: String }],
        other_name: [{ type: String }],
        cycle: { type: String },
        watering: { type: String },
        sunlight: [{ type: String }],
        soil: [{ type: String }],
        description: { type: String },
        hardiness: {
            min: { type: String },
            max: { type: String },
        },
        watering_general_benchmark: {
            value: { type: String },
            unit: { type: String },
        },
        poisonous_to_humans: { type: Boolean },
        poisonous_to_pets: { type: Boolean },
        perenualId: { type: Number },
        enrichmentSource: { type: String },
        enrichedAt: { type: Date },
        default_image: {
            thumbnail: { type: String },
            regular_url: { type: String }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model<IPlant>('Plant', PlantSchema);