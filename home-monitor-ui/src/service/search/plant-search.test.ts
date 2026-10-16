import { afterEach, describe, expect, it, vi } from 'vitest';
import { detailSearch, plantSearch } from './plant-search';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('plantSearch', () => {
    it('converts the data array from the Perenual response', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({
                data: [{
                    id: 42,
                    common_name: 'Test plant',
                    default_image: {
                        regular_url: 'https://example.com/plant.jpg',
                        thumbnail: 'https://example.com/plant-small.jpg',
                    },
                }, {
                    id: 43,
                    common_name: 'Plant without an image',
                    default_image: null,
                }],
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(plantSearch({ query: 'fern' })).resolves.toMatchObject([
            {
                perenualId: 42,
                localDetails: {
                    realName: 'Test plant',
                    plantImage: 'https://example.com/plant.jpg',
                    plantImageFallbacks: [
                        'https://example.com/plant.jpg',
                        'https://example.com/plant-small.jpg',
                    ],
                },
            },
            {
                perenualId: 43,
                localDetails: {
                    realName: 'Plant without an image',
                    plantImage: undefined,
                    plantThumbnail: undefined,
                },
            },
        ]);
        expect(fetchMock).toHaveBeenCalledWith('/api/perenual/search?q=fern');
    });

    it('rejects an unsuccessful API response with its error message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            text: async () => JSON.stringify({ error: 'Perenual API is not configured' }),
        }));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(plantSearch({ query: 'fern' })).rejects.toThrow(
            'Plant search failed (503): Perenual API is not configured',
        );
    });

    it('rejects a successful response without a data array', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ error: 'Unexpected response' }),
        }));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(plantSearch({ query: 'fern' })).rejects.toThrow(
            'Plant search returned an invalid response',
        );
    });

    it('reports errors when fetching plant details', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            text: async () => 'Please Upgrade your membership',
        }));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(detailSearch(42)).rejects.toThrow(
            'Plant details request failed (429): Please Upgrade your membership',
        );
    });

    it('shows plain-text upgrade responses for plant searches', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            text: async () => 'Please Upgrade your membership',
        }));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(plantSearch({ query: 'fern' })).rejects.toThrow(
            'Plant search failed (429): Please Upgrade your membership',
        );
    });
});
