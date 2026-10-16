import { PerenualPlantDetails, PlantSearchResult } from "./types";
import { LocalPlantDetails, PlantProps } from "../../Components/plants/Types/types";

export const searchResultsToPlantData = (results: PlantSearchResult[]) => {
    return results.map((result: PlantSearchResult) => {
        return {
            perenualId: result.id,
            owned: false,
            isSearchResult: true,
            localDetails: {
                perenualId: result.id,
                plantImage: result.default_image?.regular_url
                    || result.default_image?.medium_url
                    || result.default_image?.small_url
                    || result.default_image?.thumbnail
                    || result.default_image?.original_url,
                plantImageFallbacks: [
                    result.default_image?.regular_url,
                    result.default_image?.medium_url,
                    result.default_image?.small_url,
                    result.default_image?.thumbnail,
                    result.default_image?.original_url,
                ].filter((url): url is string => Boolean(url)),
                plantThumbnail: result.default_image?.thumbnail,
                realName: result.common_name
            } as LocalPlantDetails,
            perenualDetails: {} as PerenualPlantDetails
        } as PlantProps
    })
}
