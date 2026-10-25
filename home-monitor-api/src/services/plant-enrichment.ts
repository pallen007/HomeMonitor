import Plant from '../models/Plant';
import { fetchPerenual } from './perenual-client';

const RETRY_DELAY_MS = 60 * 60 * 1000;
const MATCH_THRESHOLD = 0.78;
const AMBIGUITY_MARGIN = 0.1;

type PerenualCandidate = {
    id: number;
    common_name?: string;
    scientific_name?: string[];
    other_name?: string[];
};

type PerenualDetail = PerenualCandidate & {
    cycle?: string;
    watering?: string;
    sunlight?: string[];
    soil?: string[];
    description?: string;
    hardiness?: { min?: string; max?: string };
    watering_general_benchmark?: { value?: string; unit?: string };
    poisonous_to_humans?: number | boolean;
    poisonous_to_pets?: number | boolean;
    default_image?: { thumbnail?: string; regular_url?: string };
};

type ScoredCandidate = PerenualCandidate & { score: number };

const normalized = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[×]/g, 'x')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const editSimilarity = (left: string, right: string) => {
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        const current = [leftIndex];
        for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
            current[rightIndex] = Math.min(
                current[rightIndex - 1] + 1,
                previous[rightIndex] + 1,
                previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
            );
        }
        previous.splice(0, previous.length, ...current);
    }
    return 1 - previous[right.length] / Math.max(left.length, right.length, 1);
};

const tokenSimilarity = (left: string, right: string) => {
    const leftTokens = new Set(left.split(' ').filter(Boolean));
    const rightTokens = new Set(right.split(' ').filter(Boolean));
    if (!leftTokens.size || !rightTokens.size) return 0;
    const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
    return (2 * overlap) / (leftTokens.size + rightTokens.size);
};

export const fuzzyMatchScore = (query: string, candidate: string): number => {
    const left = normalized(query);
    const right = normalized(candidate);
    if (!left || !right) return 0;
    if (left === right) return 1;

    return editSimilarity(left, right) * 0.65 + tokenSimilarity(left, right) * 0.35;
};

const candidateNames = (candidate: PerenualCandidate) => [
    candidate.common_name,
    ...(candidate.scientific_name ?? []),
    ...(candidate.other_name ?? []),
].filter((name): name is string => Boolean(name));

const scoreCandidates = (query: string, candidates: PerenualCandidate[]): ScoredCandidate[] => candidates
    .map((candidate) => ({
        ...candidate,
        score: Math.max(...candidateNames(candidate).map((name) => fuzzyMatchScore(query, name)), 0),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

const requestPerenualJson = async <T>(pathName: string, query: URLSearchParams): Promise<T> => {
    const response = await fetchPerenual(pathName, query);
    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Perenual returned HTTP ${response.status}: ${body || response.statusText}`);
    }
    try {
        return JSON.parse(body) as T;
    } catch (error) {
        throw new Error(`Perenual returned invalid JSON: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
};

const getSpeciesDetails = (id: number) => requestPerenualJson<PerenualDetail>(
    `/api/v2/species/details/${id}`,
    new URLSearchParams(),
);

const saveEnrichedDetails = async (plant: any, detail: PerenualDetail) => {
    const toBoolean = (value: number | boolean | undefined) => (
        value === true || value === 1 ? true : value === false || value === 0 ? false : undefined
    );
    const update: Record<string, unknown> = {
        perenualId: detail.id,
        'plantDetails.perenualId': detail.id,
        'plantDetails.scientific_name': detail.scientific_name ?? plant.plantDetails?.scientific_name ?? [],
        'plantDetails.other_name': detail.other_name ?? plant.plantDetails?.other_name ?? [],
        'plantDetails.enrichmentSource': 'Perenual',
        'plantDetails.enrichedAt': new Date(),
        'enrichment.status': 'completed',
        'enrichment.enrichedAt': new Date(),
        'enrichment.lastError': '',
    };

    for (const field of [
        'common_name',
        'cycle',
        'watering',
        'sunlight',
        'soil',
        'description',
        'hardiness',
        'watering_general_benchmark',
    ] as const) {
        if (detail[field] !== undefined) {
            update[`plantDetails.${field}`] = detail[field];
        }
    }

    const poisonousToHumans = toBoolean(detail.poisonous_to_humans);
    const poisonousToPets = toBoolean(detail.poisonous_to_pets);
    if (poisonousToHumans !== undefined) update['plantDetails.poisonous_to_humans'] = poisonousToHumans;
    if (poisonousToPets !== undefined) update['plantDetails.poisonous_to_pets'] = poisonousToPets;

    await Plant.findOneAndUpdate(
        { _id: plant._id, 'enrichment.status': 'processing' },
        {
            $set: update,
            $unset: {
                'enrichment.selectedPerenualId': 1,
                'enrichment.candidates': 1,
                'enrichment.nextRunAt': 1,
                'enrichment.message': 1,
            },
        },
    );
};

const requestCandidates = async (searchTerm: string): Promise<PerenualCandidate[]> => {
    const response = await requestPerenualJson<{ data?: PerenualCandidate[] }>(
        '/api/v2/species-list',
        new URLSearchParams({ q: searchTerm, page: '1' }),
    );
    return Array.isArray(response.data) ? response.data.filter((item) => Number.isInteger(item.id)) : [];
};

const askForUserChoice = async (plant: any, searchTerm: string, candidates: ScoredCandidate[]) => {
    const suggested = candidates.filter((candidate) => candidate.score >= 0.25);
    const message = suggested.length
        ? 'Choose the matching Perenual plant, or enter a more specific name.'
        : 'No close Perenual match was found. Enter a different common or scientific name to try again.';
    await Plant.findOneAndUpdate(
        { _id: plant._id, 'enrichment.status': 'processing' },
        {
            $set: {
                'enrichment.status': 'needs_user_action',
                'enrichment.searchTerm': searchTerm,
                'enrichment.candidates': suggested,
                'enrichment.message': message,
                'enrichment.lastError': '',
            },
            $unset: { 'enrichment.nextRunAt': 1, 'enrichment.selectedPerenualId': 1 },
        },
    );
};

const processClaimedPlant = async (plant: any) => {
    const selectedId = plant.enrichment?.selectedPerenualId;
    if (selectedId) {
        await saveEnrichedDetails(plant, await getSpeciesDetails(selectedId));
        return;
    }

    const searchTerm = plant.enrichment?.searchTerm?.trim()
        || plant.plantDetails?.scientific_name?.[0]
        || plant.wikipediaSource?.title;
    if (!searchTerm) {
        await askForUserChoice(plant, '', []);
        return;
    }

    const candidates = await requestCandidates(searchTerm);
    const scored = scoreCandidates(searchTerm, candidates);
    const top = scored[0];
    const runnerUp = scored[1];
    const isClearMatch = top?.score >= MATCH_THRESHOLD
        && (!runnerUp || top.score - runnerUp.score >= AMBIGUITY_MARGIN);

    if (!top || !isClearMatch) {
        await askForUserChoice(plant, searchTerm, scored);
        return;
    }

    await saveEnrichedDetails(plant, await getSpeciesDetails(top.id));
};

export const processOneEnrichmentTask = async (): Promise<boolean> => {
    const now = new Date();
    await Plant.updateMany(
        { 'enrichment.status': 'processing', updatedAt: { $lt: new Date(now.getTime() - RETRY_DELAY_MS) } },
        {
            $set: {
                'enrichment.status': 'pending',
                'enrichment.nextRunAt': now,
                'enrichment.lastError': 'Recovered an interrupted enrichment task.',
            },
        },
    );

    const queued = await Plant.findOne({
        'enrichment.status': 'pending',
        'enrichment.nextRunAt': { $lte: now },
    }).sort({ 'enrichment.nextRunAt': 1, createdAt: 1 });
    if (!queued) return false;

    const claimed = await Plant.findOneAndUpdate(
        { _id: queued._id, 'enrichment.status': 'pending' },
        { $set: { 'enrichment.status': 'processing' } },
        { new: true },
    );
    if (!claimed) return false;

    try {
        await processClaimedPlant(claimed);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown enrichment error';
        console.error(`Plant enrichment failed for plant ${claimed.id}:`, error);
        await Plant.findOneAndUpdate(
            { _id: claimed._id, 'enrichment.status': 'processing' },
            {
                $set: {
                    'enrichment.status': 'pending',
                    'enrichment.nextRunAt': new Date(Date.now() + RETRY_DELAY_MS),
                    'enrichment.lastError': message,
                },
            },
        );
    }

    return true;
};

export const startPlantEnrichmentWorker = () => {
    let isRunning = false;
    const run = async () => {
        if (isRunning) return;
        isRunning = true;
        try {
            await processOneEnrichmentTask();
        } catch (error) {
            console.error('Plant enrichment worker failed:', error);
        } finally {
            isRunning = false;
        }
    };

    const interval = setInterval(() => {
        void run();
    }, 60 * 60 * 1000);
    interval.unref();
    void run();
    return interval;
};
