import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../models/Plant', () => ({
    default: {
        updateMany: vi.fn(),
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
    },
}));

import Plant from '../models/Plant';
import { fuzzyMatchScore, processOneEnrichmentTask } from '../services/plant-enrichment';

const makeQueuedPlant = (searchTerm = 'Monstera deliciosa') => ({
    _id: 'database-id',
    id: 17,
    userId: 'demo-user',
    enrichment: { status: 'pending', searchTerm },
    plantDetails: { common_name: 'Monstera deliciosa' },
    wikipediaSource: { title: 'Monstera deliciosa' },
});

const setupQueue = (plant: ReturnType<typeof makeQueuedPlant>) => {
    const query = { sort: vi.fn().mockResolvedValue(plant) };
    vi.mocked(Plant.findOne).mockReturnValue(query as never);
    vi.mocked(Plant.findOneAndUpdate)
        .mockResolvedValueOnce(plant as never)
        .mockResolvedValueOnce({} as never);
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PERENUAL_API_KEY', 'test-secret');
    vi.mocked(Plant.updateMany).mockResolvedValue({} as never);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('Perenual plant enrichment', () => {
    test('scores fuzzy botanical-name matches and enriches a confident match', async () => {
        expect(fuzzyMatchScore('monstera deliciosa', 'Monstera deliciosa')).toBe(1);
        expect(fuzzyMatchScore('monstera delicosa', 'Monstera deliciosa')).toBeGreaterThan(0.78);
        expect(fuzzyMatchScore('Monstera', 'Monstera deliciosa')).toBeLessThan(0.78);
        expect(fuzzyMatchScore('fern', 'rose')).toBeLessThan(0.5);

        const plant = makeQueuedPlant();
        setupQueue(plant);
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    data: [{
                        id: 42,
                        common_name: 'Swiss cheese plant',
                        scientific_name: ['Monstera deliciosa'],
                        other_name: [],
                    }],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    id: 42,
                    common_name: 'Swiss cheese plant',
                    scientific_name: ['Monstera deliciosa'],
                    cycle: 'perennial',
                    watering: 'average',
                    sunlight: ['part shade'],
                    poisonous_to_pets: 1,
                }),
            });
        vi.stubGlobal('fetch', fetchMock);

        await expect(processOneEnrichmentTask()).resolves.toBe(true);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const searchUrl = new URL(fetchMock.mock.calls[0][0]);
        expect(searchUrl.searchParams.get('q')).toBe('Monstera deliciosa');
        expect(searchUrl.searchParams.get('key')).toBe('test-secret');
        expect(new URL(fetchMock.mock.calls[1][0]).pathname).toBe('/api/v2/species/details/42');
        expect(Plant.findOneAndUpdate).toHaveBeenLastCalledWith(
            expect.objectContaining({ _id: 'database-id', 'enrichment.status': 'processing' }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    perenualId: 42,
                    'plantDetails.watering': 'average',
                    'plantDetails.poisonous_to_pets': true,
                    'enrichment.status': 'completed',
                }),
                $unset: expect.any(Object),
            }),
        );
    });

    test('queues ambiguous matches for user clarification', async () => {
        const plant = makeQueuedPlant();
        setupQueue(plant);
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify({
                data: [
                    { id: 42, common_name: 'Swiss cheese plant', scientific_name: ['Monstera deliciosa'] },
                    { id: 43, common_name: 'Fruit salad plant', scientific_name: ['Monstera deliciosa'] },
                ],
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        await processOneEnrichmentTask();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(Plant.findOneAndUpdate).toHaveBeenLastCalledWith(
            expect.objectContaining({ _id: 'database-id', 'enrichment.status': 'processing' }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    'enrichment.status': 'needs_user_action',
                    'enrichment.candidates': expect.arrayContaining([
                        expect.objectContaining({ id: 42, score: 1 }),
                        expect.objectContaining({ id: 43, score: 1 }),
                    ]),
                }),
            }),
        );
    });
});
