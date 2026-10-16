
import * as utils from '../utils/operations';
import { PerenualPlantDetails, SearchOptions } from '../utils/types';

const readJsonResponse = async (response: Response): Promise<unknown> => {
    const body = await response.text();
    if (!body) {
        return {};
    }

    try {
        return JSON.parse(body) as unknown;
    } catch {
        if (!response.ok) {
            return body;
        }
        throw new Error('API returned an invalid JSON response');
    }
};

const getErrorMessage = (body: unknown, fallback: string) => {
    if (typeof body === 'string' && body) {
        return body;
    }
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        return body.error;
    }
    return fallback;
};

export const plantSearch = async (searchOptions: SearchOptions) => {
    const queryParams = new URLSearchParams();
    Object.entries(searchOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.set(key === 'query' ? 'q' : key, value.toString());
        }
    });
    try {
        const response = await fetch(`/api/perenual/search?${queryParams}`);
        const body = await readJsonResponse(response);
        if (!response.ok) {
            throw new Error(`Plant search failed (${response.status}): ${getErrorMessage(body, response.statusText)}`);
        }
        if (
            typeof body !== 'object'
            || body === null
            || !('data' in body)
            || !Array.isArray(body.data)
        ) {
            throw new Error('Plant search returned an invalid response');
        }
        return utils.searchResultsToPlantData(body.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const detailSearch = async (id: number) => {
    try {
        const response = await fetch(`/api/perenual/species/${id}`);
        const details = await readJsonResponse(response);
        if (!response.ok) {
            throw new Error(`Plant details request failed (${response.status}): ${getErrorMessage(details, response.statusText)}`);
        }
        return details as PerenualPlantDetails;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const diseaseSearch = async (id: number, query?: string) => {
    const queryParams = new URLSearchParams();
    if (query) queryParams.set('query', query);
    try {
        const response = await fetch(`/api/perenual/diseases/${id}?${queryParams}`);
        if (!response.ok) throw new Error(`Disease search failed (${response.status})`);
        return response.json();
    } catch (error) {
        console.error('Error fetching data', error);
    }
};