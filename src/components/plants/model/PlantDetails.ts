

export type PlantDetails = {
    plantId: number
    perenualId?: number
    careInstructions?: string
    cycle?: string
    idealMoistureLevel: number
    nickName?: string
    plantImage?: string
    realName?: string
    wateringRate?: string
}

export type SensorData = {
    plantId: number
    moistureLevel?: number
    lastWatered?: string
    sensorError?: string
}

export type PlantProps = {
  id: number
  details: PlantDetails
  sensorData?: SensorData
}