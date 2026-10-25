
import request from 'supertest';
import app from '../index';
import Plant from '../models/Plant';
import SensorData from '../models/SensorData';

vi.mock('../models/Plant', () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findOneAndDelete: vi.fn()
    }
}));

vi.mock('../models/SensorData', () => ({
    default: Object.assign(
        vi.fn((data: Record<string, unknown>) => ({
            ...data,
            save: vi.fn().mockResolvedValue(undefined)
        })),
        { findOne: vi.fn() }
    )
}));

const makeQuery = (result: unknown) => {
    const query = {
        sort: vi.fn(() => query),
        limit: vi.fn(() => query),
        select: vi.fn(() => query),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve)
    };

    return query;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Plant API', () => {
    const testPlant = {
        id: 1,
        perenualId: 12345,
        nickName: 'Test Plant',
        userId: 'user123',
        plantDetails: {
            common_name: 'Test Common Name',
            scientific_name: ['Test Scientific Name'],
            cycle: 'perennial',
            watering: 'average'
        }
    };

    test('POST /api/plants should create a new plant in a user collection', async () => {
        vi.mocked(Plant.create).mockResolvedValue(testPlant as never);

        const response = await request(app)
            .post('/api/plants')
            .send(testPlant);

        expect(response.status).toBe(201);
        expect(response.body.nickName).toBe(testPlant.nickName);
        expect(response.body.userId).toBe(testPlant.userId);
        expect(Plant.create).toHaveBeenCalledWith(testPlant);
    });

    test('POST /api/plants queues Perenual enrichment for a Wikipedia-sourced plant', async () => {
        vi.mocked(Plant.create).mockImplementation(async (data) => data as never);
        const wikipediaSource = {
            pageId: 123,
            title: 'Monstera deliciosa',
            articleUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
            summary: 'A tropical plant.',
            textLicense: 'CC BY-SA 4.0',
            textLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        };

        const response = await request(app)
            .post('/api/plants')
            .send({
                ...testPlant,
                id: 2,
                wikipediaSource,
                plantDetails: { common_name: 'Monstera deliciosa', scientific_name: [] },
            });

        expect(response.status).toBe(201);
        expect(Plant.create).toHaveBeenCalledWith(expect.objectContaining({
            wikipediaSource,
            enrichment: expect.objectContaining({
                status: 'pending',
                searchTerm: 'Monstera deliciosa',
            }),
        }));
    });

    test('POST /api/plants/enrichment-tasks re-queues the selected species for the user', async () => {
        const plant = {
            _id: 'database-id',
            userId: 'user123',
            id: 17,
            wikipediaSource: { title: 'Monstera deliciosa' },
            enrichment: {
                status: 'needs_user_action',
                searchTerm: 'Monstera deliciosa',
                candidates: [{ id: 42, score: 1 }],
            },
        };
        vi.mocked(Plant.findOne).mockResolvedValue(plant as never);
        vi.mocked(Plant.findOneAndUpdate).mockResolvedValue(plant as never);

        const response = await request(app)
            .post('/api/plants/enrichment-tasks/user123/17/resolve')
            .send({ selectedPerenualId: 42 });

        expect(response.status).toBe(200);
        expect(response.body.queued).toBe(true);
        expect(Plant.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'database-id', userId: 'user123', 'enrichment.status': 'needs_user_action' },
            expect.objectContaining({
                $set: expect.objectContaining({
                    'enrichment.status': 'pending',
                    'enrichment.selectedPerenualId': 42,
                }),
                $unset: expect.any(Object),
            }),
            { new: true },
        );
    });

    test('PUT /api/plants/:userId/:id should create or update a plant for a user', async () => {
        vi.mocked(Plant.findOneAndUpdate).mockResolvedValue(testPlant as never);

        const response = await request(app)
            .put('/api/plants/user123/1')
            .send(testPlant);

        expect(response.status).toBe(200);
        expect(response.body.nickName).toBe(testPlant.nickName);
        expect(Plant.findOneAndUpdate).toHaveBeenCalledWith(
            { userId: 'user123', id: 1 },
            { ...testPlant, userId: 'user123', id: 1 },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    });

    test('GET /api/plants/collection/:userId should return user plants', async () => {
        vi.mocked(Plant.find).mockReturnValue(makeQuery([testPlant]) as never);

        const response = await request(app)
            .get('/api/plants/collection/user123');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].nickName).toBe(testPlant.nickName);
        expect(Plant.find).toHaveBeenCalledWith({ userId: 'user123' });
    });

    test('DELETE /api/plants/:userId/:id should remove a plant from a users collection', async () => {
        vi.mocked(Plant.findOneAndDelete).mockResolvedValue(testPlant as never);

        const response = await request(app)
            .delete('/api/plants/user123/1');

        expect(response.status).toBe(200);
        expect(response.body.deleted).toBe(true);
        expect(Plant.findOneAndDelete).toHaveBeenCalledWith({ userId: 'user123', id: 1 });
    });
});

describe('Sensor API', () => {
    const testSensorData = {
        plantId: 1,
        userId: 'user123',
        moistureLevel: 75,
        temperature: 22
    };

    test('POST /api/sensor should create new sensor reading', async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        vi.mocked(SensorData).mockImplementation(() => ({ ...testSensorData, save }) as never);

        const response = await request(app)
            .post('/api/sensor')
            .send(testSensorData);
        
        expect(response.status).toBe(201);
        expect(response.body.moistureLevel).toBe(testSensorData.moistureLevel);
        expect(SensorData).toHaveBeenCalledWith(testSensorData);
        expect(save).toHaveBeenCalledOnce();
    });

    test('GET /api/sensor should return latest readings', async () => {
        vi.mocked(SensorData.findOne).mockReturnValue(makeQuery(testSensorData) as never);

        const response = await request(app)
            .get('/api/sensor?ids=1');
        
        expect(response.status).toBe(200);
        expect(response.body[0].moistureLevel).toBe(testSensorData.moistureLevel);
        expect(SensorData.findOne).toHaveBeenCalledWith({ plantId: 1 });
    });
});

describe('Summary API', () => {
    const testPlant = {
        id: 1,
        userId: 'user123',
        idealMoistureLevel: 80
    };

    const testSensorData = {
        plantId: 1,
        userId: 'user123',
        moistureLevel: 60,
        temperature: 22
    };

    test('GET /api/summary should return correct stats', async () => {
        vi.mocked(Plant.find).mockReturnValue(makeQuery([testPlant]) as never);
        vi.mocked(SensorData.findOne).mockReturnValue(makeQuery(testSensorData) as never);

        const response = await request(app)
            .get('/api/summary?userId=user123');
        
        expect(response.status).toBe(200);
        expect(response.body.totalPlants).toBe(1);
        expect(response.body.needsAttention).toBe(1); // Because moisture is below ideal
        expect(Plant.find).toHaveBeenCalledWith({ userId: 'user123' });
        expect(SensorData.findOne).toHaveBeenCalledWith({ plantId: 1 });
    });
});