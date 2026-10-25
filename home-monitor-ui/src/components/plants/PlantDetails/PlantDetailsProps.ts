import { LocalPlantDetails } from "../Types/types"

export interface PlantDetailsProps extends LocalPlantDetails {
    isSearchResult: boolean
    idealMoistureLevel?: number
}
    