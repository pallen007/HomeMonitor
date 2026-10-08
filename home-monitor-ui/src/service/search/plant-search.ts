
import * as utils from '../utils/operations';
import { PerenualPlantDetails, SearchOptions } from '../utils/types';

export const plantSearch = async (searchOptions: SearchOptions) => {
    const queryParams = new URLSearchParams();
    Object.entries(searchOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.set(key, value.toString());
        }
    });
    try {
        const response = await fetch(`/api/perenual/search?${queryParams}`);
        if (!response.ok) throw new Error(`Plant search failed (${response.status})`);
        return utils.searchResultsToPlantData(await response.json());
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const detailSearch = async (id: number) => {
    try {
        const response = await fetch(`/api/perenual/species/${id}`);
        if (!response.ok) throw new Error(`Plant details request failed (${response.status})`);
        return await response.json() as PerenualPlantDetails;
    } catch (error) {
        console.error('Error fetching data:', error);
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