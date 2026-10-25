import * as utils from '../utils/operations';
import { WikipediaPlantResult } from '../utils/types';

const readJsonResponse = async (response: Response): Promise<unknown> => {
    const body = await response.text();
    if (!body) return {};

    try {
        return JSON.parse(body) as unknown;
    } catch {
        if (!response.ok) return body;
        throw new Error('API returned an invalid JSON response');
    }
};

const getErrorMessage = (body: unknown, fallback: string) => {
    if (typeof body === 'string' && body) return body;
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        return body.error;
    }
    return fallback;
};

export const wikipediaPlantSearch = async (query: string) => {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`/api/wikipedia/search?${params}`);
    const body = await readJsonResponse(response);
    if (!response.ok) {
        throw new Error(`Wikipedia plant search failed (${response.status}): ${getErrorMessage(body, response.statusText)}`);
    }
    if (
        typeof body !== 'object'
        || body === null
        || !('results' in body)
        || !Array.isArray(body.results)
    ) {
        throw new Error('Wikipedia plant search returned an invalid response');
    }
    return utils.wikipediaResultsToPlantData(body.results as WikipediaPlantResult[]);
};
