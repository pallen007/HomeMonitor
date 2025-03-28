export type SearchOptions = {
    key: string
    page?: number
    query?: string
    order?: 'asc' | 'desc'
    edible?: boolean | null
    poisonous?: boolean | null
    cycle?: 'perennial' | 'annual' | 'biennial' | 'biannual'
    watering?: 'frequent' | 'average' | 'minumum' | 'none'
    sunlight?: 'full_shade' | 'part_shade' | 'sun-part_shade' | 'full_sun'
    indoor?: boolean | null
    hardiness?: number // Hardness zone, 1-13
}
export const defaultSearchOptions: SearchOptions = {
    key: '',
    page: 1,
    query: '',
    order: 'asc',
    edible: null,
    poisonous: null,
    cycle: 'annual',
    watering: 'average',
    sunlight: 'full_sun',
    indoor: null,
    hardiness: 1,
};

export type PlantSearchResult = {
    id: number
    common_name: string
    scientific_name: string[]
    other_name: string[]
    family: string | null
    hybrid: string | null
    authority: string | null
    subspecies: string | null
    cultivar: string | null
    variety: string | null
    species_epithet: string
    genus: string
    default_image: {
        image_id: number
        license: number
        license_name: string
        license_url: string
        original_url: string
        regular_url: string
        medium_url: string
        small_url: string
        thumbnail: string
    }
}

export type PlantDetails = {
    id: number
    common_name?: string
    scientific_name?: string[]
    other_name?: string[]
    family?: string | null
    origin?: string | null
    type?: string
    dimensions?: {
        type?: string | null
        min_value?: number
        max_value?: number
        unit?: string
    }
    cycle?: string
    watering?: string
    watering_general_benchmark?: {
        value?: string
        unit?: string
    }
    plant_anatomy?: {
        part?: string
        color?: string[]
    }[]
    sunlight?: string[]
    pruning_month?: string[]
    pruning_count?: {
        amount?: number
        interval?: string
    }
    seeds?: number
    attracts?: string[]
    propagation?: string[]
    hardiness?: {
        min?: string
        max?: string
    }
    hardiness_location?: {
        full_url?: string
        full_iframe?: string
    }
    flowers?: boolean
    flowering_season?: string | null
    soil?: string[]
    pest_susceptibility?: string | null
    cones?: boolean
    fruits?: boolean
    edible_fruit?: boolean
    fruiting_season?: string | null
    harvest_season?: string | null
    harvest_method?: string | null
    leaf?: boolean
    edible_leaf?: boolean
    growth_rate?: string
    maintenance?: string
    medicinal?: boolean
    poisonous_to_humans?: boolean
    poisonous_to_pets?: boolean
    drought_tolerant?: boolean
    salt_tolerant?: boolean
    thorny?: boolean
    invasive?: boolean
    rare?: boolean
    tropical?: boolean
    cuisine?: boolean
    indoor?: boolean
    care_level?: string
    description?: string
    default_image?: {
        image_id?: number
        license?: number
        license_name?: string
        license_url?: string
        original_url?: string
        regular_url?: string
        medium_url?: string
        small_url?: string
        thumbnail?: string
    }
    other_images?: {
        image_id?: number
        license?: number
        license_name?: string
        license_url?: string
        original_url?: string
        regular_url?: string
        medium_url?: string
        small_url?: string
        thumbnail?: string
    }[]
    xWateringQuality?: string[]
    xWateringPeriod?: string[]
    xWateringAvgVolumeRequirement?: string[]
    xWateringDepthRequirement?: string[]
    xWateringBasedTemperature?: {
        unit?: string
        min?: number
        max?: number
    }
    xWateringPhLevel?: {
        min?: number
        max?: number
    }
    xSunlightDuration?: {
        min?: string
        max?: string
        unit?: string
    }
}