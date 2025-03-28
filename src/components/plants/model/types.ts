import { PlantDetails } from "../../../service/utils/types"


export type PreviewDetails = {
    plantDescription?: string
    careInstructions?: string
    cycle?: string
    nickName?: string
    plantImage?: string
    plantThumbnail?: string
    realName?: string
    wateringRate?: string
}

export type SensorData = {
    plantId: number
    idealMoistureLevel: number
    moistureLevel?: number
    lastWatered?: string
    sensorError?: string
}

export type PlantProps = {
  perenualId: number
  owned: boolean
  previewDetails: PreviewDetails
  sensorData?: SensorData
  perenualDetails: PlantDetails

}
