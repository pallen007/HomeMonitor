import { WikipediaPlantResult } from "./types";
import { LocalPlantDetails, PlantProps } from "../../components/plants/Types/types";

export const wikipediaResultsToPlantData = (results: WikipediaPlantResult[]) => {
    return results.map((result: WikipediaPlantResult) => {
        return {
            id: result.pageId,
            owned: false,
            isSearchResult: true,
            localDetails: {
                plantImage: result.imageUrl,
                plantImageFallbacks: result.imageUrl ? [result.imageUrl] : [],
                plantThumbnail: result.imageUrl,
                realName: result.title,
                plantDescription: result.summary,
                wikipediaPageId: result.pageId,
                wikipediaArticleUrl: result.articleUrl,
                wikipediaTextLicense: result.textLicense,
                wikipediaTextLicenseUrl: result.textLicenseUrl,
                imageSourceUrl: result.imageSourceUrl,
                imageAttribution: result.imageAttribution,
                imageLicense: result.imageLicense,
                imageLicenseUrl: result.imageLicenseUrl,
            } as LocalPlantDetails,
            wikipediaSource: result,
        } as PlantProps
    })
}
