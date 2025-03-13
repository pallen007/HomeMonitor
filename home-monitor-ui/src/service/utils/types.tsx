export type SearchOptions = {
    key: string;
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
    hardiness: 1
};