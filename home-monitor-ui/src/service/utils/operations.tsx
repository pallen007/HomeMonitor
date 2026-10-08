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
                plantImage: result.default_image.regular_url,
                plantThumbnail: result.default_image.thumbnail,
                realName: result.common_name
            } as LocalPlantDetails,
            perenualDetails: {} as PerenualPlantDetails
        } as PlantProps
    })
}
