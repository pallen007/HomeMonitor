import { SearchOptions } from "./types";
import { perenualAPIKey } from "../../../assets/credentials.json"


export const createListQueryParams = (searchOptions: SearchOptions) => {
    const params = new URLSearchParams();
    params.append('key', perenualAPIKey);
    if (searchOptions.page) {
        params.append('page', searchOptions.page.toString());
    }
    if (searchOptions.query) {
        params.append('query', searchOptions.query);
    }
    if (searchOptions.order) {
        params.append('order', searchOptions.order);
    }
    if (searchOptions.edible) {
        params.append('edible', searchOptions.edible.toString());
    }
    if (searchOptions.poisonous) {
        params.append('poisonous', searchOptions.poisonous.toString());
    }
    if (searchOptions.cycle) {
        params.append('cycle', searchOptions.cycle);
    }
    if (searchOptions.watering) {
        params.append('watering', searchOptions.watering);
    }
    if (searchOptions.sunlight) {
        params.append('sunlight', searchOptions.sunlight);
    }
    if (searchOptions.indoor) {
        params.append('indoor', searchOptions.indoor.toString());
    }
    if (searchOptions.hardiness) {
        params.append('hardiness', searchOptions.hardiness.toString());
    }
    return params;
}

export const createDetailQueryParams = (id: number) => {
    const params = new URLSearchParams();
    params.append('key', perenualAPIKey);
    params.append('id', id.toString());
    return params;
}

export const createDiseaseListQueryParams = (id: number, query?: string) => {
    const params = new URLSearchParams();
    params.append('key', perenualAPIKey);
    params.append('id', id.toString());
    if (query) {
        params.append('query', query);
    }
    return params;
}