export interface LocalPlantDetails {
    perenualId?: number
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
    idealMoistureLevel?: number
    moistureLevel?: number
    lastWatered?: string
    sensorError?: string
    timestamp?: string
}

export type PlantProps = {
    id?: number
    perenualId?: number
    owned?: boolean
    isSearchResult?: boolean
    localDetails?: LocalPlantDetails
    sensorData?: SensorData
    onAddToCollection?: (plant: PlantProps) => void | Promise<void>
    onRemoveFromCollection?: (plantId?: number) => void | Promise<void>
    onMarkWatered?: (plantId?: number) => void | Promise<void>
}

