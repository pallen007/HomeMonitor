import express from 'express';
import Plant, { IPlant } from '../models/Plant';

const router: any = (express as any).Router();

const parsePlantId = (value: string | undefined) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

router.get('/collection', (req: any, res: any) => {
    const userId = req.query.userId?.toString();
    const ids = req.query.ids?.toString().split(',').map((id: string) => Number(id)).filter((id: number) => !Number.isNaN(id)) || [];

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const query = ids.length ? { userId, id: { $in: ids } } : { userId };

    Plant.find(query)
        .sort({ updatedAt: -1 })
        .then((plants) => res.json(plants))
        .catch((error) => {
            console.error('Error fetching plants:', error);
            res.status(500).json({ error: 'Failed to fetch plants' });
        });
});

router.get('/collection/:userId', (req: any, res: any) => {
    const { userId } = req.params;
    const ids = req.query.ids?.toString().split(',').map((id: string) => Number(id)).filter((id: number) => !Number.isNaN(id)) || [];

    const query = ids.length ? { userId, id: { $in: ids } } : { userId };

    Plant.find(query)
        .sort({ updatedAt: -1 })
        .then((plants) => res.json(plants))
        .catch((error) => {
            console.error('Error fetching plants:', error);
            res.status(500).json({ error: 'Failed to fetch plants' });
        });
});

router.get('/enrichment-tasks/:userId', async (req: any, res: any) => {
    try {
        const tasks = await Plant.find({
            userId: req.params.userId,
            'enrichment.status': 'needs_user_action',
        }).select('id nickName plantDetails.common_name wikipediaSource enrichment');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching plant enrichment tasks:', error);
        res.status(500).json({ error: 'Failed to fetch plant enrichment tasks' });
    }
});

router.post('/enrichment-tasks/:userId/:id/resolve', async (req: any, res: any) => {
    const plantId = parsePlantId(req.params.id);
    const { userId } = req.params;
    const body = req.body ?? {};
    const selectedPerenualId = Number(body.selectedPerenualId);
    const searchTerm = typeof body.searchTerm === 'string' ? body.searchTerm.trim() : '';

    if (plantId === null) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }
    if ((!Number.isInteger(selectedPerenualId) || selectedPerenualId < 1) && (!searchTerm || searchTerm.length > 200)) {
        return res.status(400).json({ error: 'Select a match or provide a name up to 200 characters' });
    }

    try {
        const plant = await Plant.findOne({ userId, id: plantId, 'enrichment.status': 'needs_user_action' });
        if (!plant) {
            return res.status(404).json({ error: 'Plant enrichment task not found' });
        }

        const candidateIds = plant.enrichment?.candidates?.map((candidate) => candidate.id) ?? [];
        if (Number.isInteger(selectedPerenualId) && selectedPerenualId > 0 && !candidateIds.includes(selectedPerenualId)) {
            return res.status(400).json({ error: 'The selected plant is not one of the suggested matches' });
        }

        const update = await Plant.findOneAndUpdate(
            { _id: plant._id, userId, 'enrichment.status': 'needs_user_action' },
            {
                $set: {
                    'enrichment.status': 'pending',
                    'enrichment.nextRunAt': new Date(),
                    'enrichment.searchTerm': searchTerm || plant.enrichment?.searchTerm || plant.wikipediaSource?.title,
                    ...(Number.isInteger(selectedPerenualId) && selectedPerenualId > 0
                        ? { 'enrichment.selectedPerenualId': selectedPerenualId }
                        : {}),
                    'enrichment.lastError': '',
                },
                $unset: { 'enrichment.candidates': 1, 'enrichment.message': 1 },
            },
            { new: true },
        );

        return res.json({ queued: Boolean(update) });
    } catch (error) {
        console.error('Error resolving plant enrichment task:', error);
        return res.status(500).json({ error: 'Failed to queue plant enrichment task' });
    }
});

router.get('/:userId/:id', (req: any, res: any) => {
    const id = parsePlantId(req.params.id);
    const { userId } = req.params;

    if (id === null) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }

    Plant.findOne({ userId, id })
        .then((plant) => {
            if (!plant) {
                return res.status(404).json({ error: 'Plant not found' });
            }
            res.json(plant);
        })
        .catch((error) => {
            console.error('Error fetching plant:', error);
            res.status(500).json({ error: 'Failed to fetch plant' });
        });
});

router.post('/', async (req: any, res: any) => {
    const plantDetails: IPlant = req.body ?? {};

    if (!plantDetails.userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (plantDetails.id === undefined || plantDetails.id === null) {
        return res.status(400).json({ error: 'Plant id is required' });
    }

    const source = plantDetails.wikipediaSource;
    if (source) {
        try {
            const articleUrl = new URL(source.articleUrl);
            const articleLicenseUrl = new URL(source.textLicenseUrl);
            if (
                articleUrl.protocol !== 'https:'
                || articleUrl.hostname !== 'en.wikipedia.org'
                || articleLicenseUrl.protocol !== 'https:'
                || articleLicenseUrl.hostname !== 'creativecommons.org'
            ) {
                return res.status(400).json({ error: 'Wikipedia attribution metadata is invalid' });
            }
            if (source.imageUrl) {
                const imageUrl = new URL(source.imageUrl);
                const imageSourceUrl = source.imageSourceUrl ? new URL(source.imageSourceUrl) : null;
                const imageLicenseUrl = source.imageLicenseUrl ? new URL(source.imageLicenseUrl) : null;
                if (
                    imageUrl.protocol !== 'https:'
                    || imageUrl.hostname !== 'upload.wikimedia.org'
                    || imageSourceUrl?.protocol !== 'https:'
                    || imageSourceUrl.hostname !== 'commons.wikimedia.org'
                    || imageLicenseUrl?.protocol !== 'https:'
                    || !['creativecommons.org', 'gnu.org', 'www.gnu.org'].includes(imageLicenseUrl.hostname)
                    || !source.imageLicense
                ) {
                    return res.status(400).json({ error: 'Wikipedia image attribution metadata is invalid' });
                }
            }
        } catch {
            return res.status(400).json({ error: 'Wikipedia attribution metadata is invalid' });
        }
    }

    const data = source
        ? {
            ...plantDetails,
            enrichment: {
                status: 'pending' as const,
                searchTerm: plantDetails.plantDetails?.scientific_name?.[0] || source.title,
                nextRunAt: new Date(),
            },
        }
        : plantDetails;
    try {
        const createdPlant = await Plant.create(data);
        return res.status(201).json(createdPlant);
    } catch (error) {
        console.error('Error creating plant:', error);
        return res.status(500).json({ error: 'Failed to create plant' });
    }
});

router.put('/:userId/:id', (req: any, res: any) => {
    const id = parsePlantId(req.params.id);
    const { userId } = req.params;
    const plantDetails: IPlant = req.body;

    if (id === null) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }

    Plant.findOneAndUpdate({ userId, id }, {
        ...plantDetails,
        userId,
        id,
    }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    })
        .then((updatedPlant) => res.json(updatedPlant))
        .catch((error) => {
            console.error('Error updating plant:', error);
            res.status(500).json({ error: 'Failed to update plant' });
        });
});

router.delete('/:userId/:id', (req: any, res: any) => {
    const id = parsePlantId(req.params.id);
    const { userId } = req.params;

    if (id === null) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }

    Plant.findOneAndDelete({ userId, id })
        .then((deletedPlant) => {
            if (!deletedPlant) {
                return res.status(404).json({ error: 'Plant not found' });
            }

            res.json({ deleted: true, plantId: id, userId });
        })
        .catch((error) => {
            console.error('Error deleting plant:', error);
            res.status(500).json({ error: 'Failed to delete plant' });
        });
});

export default router;