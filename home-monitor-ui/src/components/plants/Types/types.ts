export interface LocalPlantDetails {
    perenualId?: number
    plantDescription?: string
    careInstructions?: string
    cycle?: string
    nickName?: string
    plantImage?: string
    plantImageFallbacks?: string[]
    plantThumbnail?: string
    realName?: string
    wateringRate?: string
    scientificName?: string
    wikipediaPageId?: number
    wikipediaArticleUrl?: string
    wikipediaTextLicense?: string
    wikipediaTextLicenseUrl?: string
    imageSourceUrl?: string
    imageAttribution?: string
    imageLicense?: string
    imageLicenseUrl?: string
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
    enrichmentStatus?: 'pending' | 'processing' | 'needs_user_action' | 'completed'
    owned?: boolean
    isSearchResult?: boolean
    localDetails?: LocalPlantDetails
    wikipediaSource?: {
        pageId: number
        title: string
        articleUrl: string
        summary: string
        textLicense: string
        textLicenseUrl: string
        imageUrl?: string
        imageSourceUrl?: string
        imageAttribution?: string
        imageLicense?: string
        imageLicenseUrl?: string
    }
    sensorData?: SensorData
    onAddToCollection?: (plant: PlantProps) => void | Promise<void>
    onRemoveFromCollection?: (plantId?: number) => void | Promise<void>
    onMarkWatered?: (plantId?: number) => void | Promise<void>
}
