export interface LocalPlantDetails {
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

