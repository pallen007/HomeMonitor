
import * as utils from '../utils/operations'
import { SearchOptions } from '../utils/types'

export const plantSearch = async (searchOptions: SearchOptions) => { 

    const queryParams = utils.createListQueryParams(searchOptions)
    try {
        const response = await fetch(`https://perenual.com/api/v2/species-list` + queryParams,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            return utils.searchResultsToPlantData(await response.json())
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

export const detailSearch = async (id: number, owned: boolean) => {
    const queryParams = utils.createDetailQueryParams(id)
    try {
        const response = await fetch(`https://perenual.com/api/v2/species/details/` + queryParams,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            return utils.detailResultsToPlantData(owned, await response.json())
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

export const diseaseSearch = async (id: number, query?: string) => {
    const queryParams = utils.createDiseaseListQueryParams(id, query)
    try {
        const response = await fetch(`https://perenual.com/api/pest-disease-list` + queryParams,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            return response.json()
    } catch (error) {
        console.error("Error fetching data", error)
    }
}