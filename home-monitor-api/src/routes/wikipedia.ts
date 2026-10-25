import express from 'express';

const router: any = (express as any).Router();
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';
let requestQueue: Promise<void> = Promise.resolve();

type WikipediaPage = {
    pageid: number;
    title: string;
    fullurl: string;
    extract?: string;
    pageimage?: string;
    thumbnail?: { source: string };
};

type CommonsImageInfo = {
    title: string;
    imageinfo?: Array<{
        url: string;
        thumburl?: string;
        descriptionurl: string;
        extmetadata?: Record<string, { value?: string }>;
    }>;
};

const makeUserAgent = () => {
    const contact = process.env.WIKIPEDIA_CONTACT_EMAIL?.trim();
    return `HomeMonitor/1.0 (https://github.com/pallen007/HomeMonitor${contact ? `; ${contact}` : ''})`;
};

const requestJson = async <T>(url: URL, apiName: string): Promise<T> => {
    const request = requestQueue.then(async () => {
        const response = await fetch(url, {
            headers: {
                'User-Agent': makeUserAgent(),
                'Api-User-Agent': makeUserAgent(),
            },
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            throw new Error(`${apiName} returned HTTP ${response.status}`);
        }

        return response.json() as Promise<T>;
    });
    requestQueue = request.then(() => undefined, () => undefined);
    return request;
};

const removeHtml = (value: string | undefined): string | undefined => value
    ?.replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const makeWikipediaUrl = (query: string): URL => {
    const url = new URL(WIKIPEDIA_API_URL);
    url.search = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        generator: 'search',
        gsrsearch: query,
        gsrnamespace: '0',
        gsrlimit: '10',
        prop: 'pageimages|extracts|info',
        inprop: 'url',
        piprop: 'thumbnail|name',
        pithumbsize: '480',
        exintro: '1',
        explaintext: '1',
        exchars: '700',
        maxlag: '5',
    }).toString();
    return url;
};

const makeCommonsUrl = (fileTitles: string[]): URL => {
    const url = new URL(COMMONS_API_URL);
    url.search = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        titles: fileTitles.map((title) => `File:${title}`).join('|'),
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: '480',
        maxlag: '5',
    }).toString();
    return url;
};

const normalizeFileTitle = (title: string) => title.replace(/^File:/i, '').replace(/_/g, ' ').toLowerCase();
const normalizeLicenseUrl = (value: string | undefined) => {
    if (!value) return undefined;
    try {
        const url = new URL(value.replace(/^http:/i, 'https:'));
        if (
            url.protocol !== 'https:'
            || !['creativecommons.org', 'gnu.org', 'www.gnu.org'].includes(url.hostname)
        ) {
            return undefined;
        }
        return url.toString();
    } catch {
        return undefined;
    }
};

router.get('/search', async (req: any, res: any) => {
    const query = req.query.q?.toString().trim();
    if (!query || query.length > 200) {
        return res.status(400).json({ error: 'A search query between 1 and 200 characters is required' });
    }

    try {
        const wikipediaResponse = await requestJson<{ query?: { pages?: WikipediaPage[] } }>(
            makeWikipediaUrl(query),
            'Wikipedia API',
        );
        const pages = wikipediaResponse.query?.pages ?? [];
        const imageTitles = Array.from(new Set(pages.flatMap((page) => page.pageimage ? [page.pageimage] : [])));

        let imageInfoByTitle = new Map<string, CommonsImageInfo>();
        if (imageTitles.length) {
            const commonsResponse = await requestJson<{ query?: { pages?: CommonsImageInfo[] } }>(
                makeCommonsUrl(imageTitles),
                'Wikimedia Commons API',
            );
            imageInfoByTitle = new Map(
                (commonsResponse.query?.pages ?? []).map((page) => [normalizeFileTitle(page.title), page]),
            );
        }

        const results = pages.map((page) => {
            const imageInfo = page.pageimage
                ? imageInfoByTitle.get(normalizeFileTitle(page.pageimage))?.imageinfo?.[0]
                : undefined;
            const metadata = imageInfo?.extmetadata;
            const imageLicense = removeHtml(metadata?.LicenseShortName?.value);
            const imageLicenseUrl = normalizeLicenseUrl(metadata?.LicenseUrl?.value);
            const imageAttribution = removeHtml(
                metadata?.Attribution?.value || metadata?.Artist?.value || metadata?.Credit?.value,
            );
            const hasUsableImageLicense = Boolean(imageLicense && imageLicenseUrl && imageInfo?.descriptionurl);

            return {
                pageId: page.pageid,
                title: page.title,
                articleUrl: page.fullurl,
                summary: page.extract || '',
                imageUrl: hasUsableImageLicense ? imageInfo?.thumburl || imageInfo?.url : undefined,
                imageSourceUrl: hasUsableImageLicense ? imageInfo?.descriptionurl : undefined,
                imageAttribution: hasUsableImageLicense ? imageAttribution : undefined,
                imageLicense: hasUsableImageLicense ? imageLicense : undefined,
                imageLicenseUrl: hasUsableImageLicense ? imageLicenseUrl : undefined,
                textLicense: 'CC BY-SA 4.0',
                textLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
            };
        });

        return res.json({ results });
    } catch (error) {
        console.error('Unable to search Wikipedia for plants:', error);
        return res.status(502).json({ error: 'Wikipedia plant search failed' });
    }
});

export default router;
