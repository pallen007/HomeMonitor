import { PerenualPlantDetails } from "../../../service/utils/types"
import { LocalPlantDetails } from "../Types/types"

export interface PlantDetailsProps {
    localDetails: LocalPlantDetails
    plantDetails: PerenualPlantDetails
    isSearchResult: boolean
    }
    