import { PlantDetails, PlantSearchResult, SearchOptions } from "./types";
import { perenualAPIKey } from "../../../assets/credentials.json"
import { PreviewDetails, PlantProps } from "../../components/plants/model/types";


export const createListQueryParams = (searchOptions: SearchOptions) => {
    const params = new URLSearchParams()
    params.append('key', perenualAPIKey)
    if (searchOptions.page) {
        params.append('page', searchOptions.page.toString())
    }
    if (searchOptions.query) {
        params.append('query', searchOptions.query)
    }
    if (searchOptions.order) {
        params.append('order', searchOptions.order)
    }
    if (searchOptions.edible) {
        params.append('edible', searchOptions.edible.toString())
    }
    if (searchOptions.poisonous) {
        params.append('poisonous', searchOptions.poisonous.toString())
    }
    if (searchOptions.cycle) {
        params.append('cycle', searchOptions.cycle)
    }
    if (searchOptions.watering) {
        params.append('watering', searchOptions.watering)
    }
    if (searchOptions.sunlight) {
        params.append('sunlight', searchOptions.sunlight)
    }
    if (searchOptions.indoor) {
        params.append('indoor', searchOptions.indoor.toString())
    }
    if (searchOptions.hardiness) {
        params.append('hardiness', searchOptions.hardiness.toString())
    }
    return params
}

export const createDetailQueryParams = (id: number) => {
    const params = new URLSearchParams()
    params.append('key', perenualAPIKey)
    params.append('id', id.toString())
    return params
}

export const createDiseaseListQueryParams = (id: number, query?: string) => {
    const params = new URLSearchParams()
    params.append('key', perenualAPIKey)
    params.append('id', id.toString())
    if (query) {
        params.append('query', query)
    }
    return params
}

export const searchResultsToPlantData = (results: PlantSearchResult[]) => {
    return results.map((result: PlantSearchResult) => {
        return {
            perenualId: result.id,
            owned: false,
            previewDetails: {
                perenualId: result.id,
                plantImage: result.default_image.regular_url,
                plantThumbnail: result.default_image.thumbnail,
                realName: result.common_name
            },
            perenualDetails: {} as PlantDetails
        } as PlantProps
    })
}

export const detailResultsToPlantData = (owned: boolean, results: PlantDetails) => {
    return {
        previewDetails: {} as PreviewDetails,
        perenualId: results.id,
        owned: owned,
        perenualDetails: results as PlantDetails
    } as PlantProps
}