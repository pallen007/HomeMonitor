import { afterEach, describe, expect, it, vi } from 'vitest';
import { wikipediaPlantSearch } from './plant-search';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('wikipediaPlantSearch', () => {
    it('requests Wikipedia results and maps article and license metadata', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({
                results: [{
                    pageId: 123,
                    title: 'Monstera deliciosa',
                    articleUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
                    summary: 'A tropical plant.',
                    imageUrl: 'https://upload.wikimedia.org/example.jpg',
                    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
                    imageAttribution: 'Example photographer',
                    imageLicense: 'CC BY-SA 4.0',
                    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
                    textLicense: 'CC BY-SA 4.0',
                    textLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
                }],
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(wikipediaPlantSearch('Monstera deliciosa')).resolves.toMatchObject([{
            id: 123,
            localDetails: {
                realName: 'Monstera deliciosa',
                plantDescription: 'A tropical plant.',
                plantImage: 'https://upload.wikimedia.org/example.jpg',
                imageAttribution: 'Example photographer',
                imageLicense: 'CC BY-SA 4.0',
            },
            wikipediaSource: {
                articleUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
                textLicense: 'CC BY-SA 4.0',
            },
        }]);
        expect(fetchMock).toHaveBeenCalledWith('/api/wikipedia/search?q=Monstera+deliciosa');
    });

    it('surfaces search errors instead of returning an empty result set', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 502,
            statusText: 'Bad Gateway',
            text: async () => JSON.stringify({ error: 'Wikipedia plant search failed' }),
        }));

        await expect(wikipediaPlantSearch('fern')).rejects.toThrow(
            'Wikipedia plant search failed (502): Wikipedia plant search failed',
        );
    });
});
