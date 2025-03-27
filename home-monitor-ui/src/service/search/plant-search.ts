
import * as utils from '../utils/operations'


export const plantSearch = async (searchOptions) => { 

    const queryParams = utils.createListQueryParams(searchOptions)
    try {
        const response = await fetch(`https://perenual.com/api/v2/species-list` + queryParams,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            return response.json()
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export const detailSearch = async (id: number) => {
    const queryParams = utils.createDetailQueryParams(id)
    try {
        const response = await fetch(`https://perenual.com/api/v2/species/details/` + queryParams,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            return response.json()
    } catch (error) {
        console.error("Error fetching data:", error);
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