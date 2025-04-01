// import { PerenualPlantDetails } from "../../../service/utils/types"
import { LocalPlantDetails, SensorData } from "../Types/types"

export type PlantProps = {
    perenualId: number
    owned: boolean
    localDetails: LocalPlantDetails
    isSearchResult: boolean
    sensorData?: SensorData
  }