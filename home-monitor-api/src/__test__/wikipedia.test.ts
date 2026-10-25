import request from 'supertest';
import { afterEach, describe, expect, test, vi } from 'vitest';
import app from '../index';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Wikipedia plant lookup', () => {
    test('uses one generator request and a sequential bundled Commons license lookup', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: [{
                            pageid: 123,
                            title: 'Monstera deliciosa',
                            fullurl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
                            extract: 'A tropical plant.',
                            pageimage: 'Example.jpg',
                        }],
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: [{
                            title: 'File:Example.jpg',
                            imageinfo: [{
                                url: 'https://upload.wikimedia.org/example.jpg',
                                thumburl: 'https://upload.wikimedia.org/example-small.jpg',
                                descriptionurl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
                                extmetadata: {
                                    Artist: { value: '<a>Example photographer</a>' },
                                    LicenseShortName: { value: 'CC BY-SA 4.0' },
                                    LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0/' },
                                },
                            }],
                        }],
                    },
                }),
            });
        vi.stubGlobal('fetch', fetchMock);

        const response = await request(app).get('/api/wikipedia/search?q=Monstera%20deliciosa');

        expect(response.status).toBe(200);
        expect(response.body.results[0]).toMatchObject({
            pageId: 123,
            title: 'Monstera deliciosa',
            summary: 'A tropical plant.',
            imageUrl: 'https://upload.wikimedia.org/example-small.jpg',
            imageAttribution: 'Example photographer',
            imageLicense: 'CC BY-SA 4.0',
            imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
            textLicense: 'CC BY-SA 4.0',
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const wikipediaUrl = new URL(fetchMock.mock.calls[0][0]);
        expect(wikipediaUrl.searchParams.get('generator')).toBe('search');
        expect(wikipediaUrl.searchParams.get('prop')).toBe('pageimages|extracts|info');
        const commonsUrl = new URL(fetchMock.mock.calls[1][0]);
        expect(commonsUrl.searchParams.get('titles')).toBe('File:Example.jpg');
        expect(fetchMock.mock.calls[0][1].headers['User-Agent']).toContain('HomeMonitor/1.0');
    });

    test('serializes requests across concurrent search requests', async () => {
        let activeRequests = 0;
        let maximumActiveRequests = 0;
        const fetchMock = vi.fn(async () => {
            activeRequests += 1;
            maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
            await new Promise((resolve) => setTimeout(resolve, 5));
            activeRequests -= 1;
            return { ok: true, json: async () => ({ query: { pages: [] } }) };
        });
        vi.stubGlobal('fetch', fetchMock);

        const responses = await Promise.all([
            request(app).get('/api/wikipedia/search?q=fern'),
            request(app).get('/api/wikipedia/search?q=rose'),
        ]);

        expect(responses.map((response) => response.status)).toEqual([200, 200]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(maximumActiveRequests).toBe(1);
    });

    test('omits article images when Commons does not provide an accepted license', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: [{
                            pageid: 9,
                            title: 'Example plant',
                            fullurl: 'https://en.wikipedia.org/wiki/Example_plant',
                            pageimage: 'Unknown-license.jpg',
                        }],
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: [{
                            title: 'File:Unknown-license.jpg',
                            imageinfo: [{
                                url: 'https://upload.wikimedia.org/unknown.jpg',
                                descriptionurl: 'https://commons.wikimedia.org/wiki/File:Unknown-license.jpg',
                                extmetadata: {
                                    LicenseShortName: { value: 'Unknown' },
                                    LicenseUrl: { value: 'https://example.org/license' },
                                },
                            }],
                        }],
                    },
                }),
            }));

        const response = await request(app).get('/api/wikipedia/search?q=Example%20plant');

        expect(response.status).toBe(200);
        expect(response.body.results[0].imageUrl).toBeUndefined();
        expect(response.body.results[0].imageLicense).toBeUndefined();
    });

    test('validates query and exposes upstream failures', async () => {
        const invalid = await request(app).get('/api/wikipedia/search');
        expect(invalid.status).toBe(400);

        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
        const failed = await request(app).get('/api/wikipedia/search?q=fern');
        expect(failed.status).toBe(502);
        expect(failed.body.error).toBe('Wikipedia plant search failed');
    });
});
