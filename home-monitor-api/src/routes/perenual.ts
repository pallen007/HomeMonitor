import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const router: any = (express as any).Router();
const PERENUAL_BASE_URL = 'https://perenual.com';

const getApiKey = () => {
    if (process.env.PERENUAL_API_KEY) {
        return process.env.PERENUAL_API_KEY;
    }

    const credentialsPath = path.resolve(__dirname, '../../credentials.json');
    if (!existsSync(credentialsPath)) {
        return undefined;
    }

    try {
        const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8')) as { perenualAPIKey?: string };
        return credentials.perenualAPIKey?.trim() || undefined;
    } catch (error) {
        console.error('Unable to read Perenual credentials file:', error);
        return undefined;
    }
};

const forwardRequest = async (path: string, query: URLSearchParams, res: any) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return res.status(503).json({ error: 'Perenual API is not configured' });
    }

    query.set('key', apiKey);
    const url = new URL(path, PERENUAL_BASE_URL + '/');
    url.search = query.toString();

    let response: Response;
    try {
        response = await fetch(url);
    } catch (error) {
        console.error('Unable to connect to Perenual API:', error);
        return res.status(502).json({ error: 'Perenual request failed' });
    }

    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();
    if (!contentType.includes('application/json')) {
        return res.status(response.status).set('Content-Type', contentType).send(body);
    }

    try {
        return res.status(response.status).json(JSON.parse(body));
    } catch (error) {
        console.error(`Perenual API returned invalid JSON (HTTP ${response.status}):`, error);
        return res.status(502).json({ error: 'Perenual returned an invalid response' });
    }
};

router.get('/search', (req: any, res: any) => {
    const query = new URLSearchParams();
    const allowedParameters = ['page', 'q', 'order', 'edible', 'poisonous', 'cycle', 'watering', 'sunlight', 'indoor', 'hardiness'];

    for (const parameter of allowedParameters) {
        const value = req.query[parameter]?.toString();
        if (value !== undefined && value !== '') {
            query.set(parameter, value);
        }
    }

    return forwardRequest('/api/v2/species-list', query, res);
});

router.get('/species/:id', (req: any, res: any) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }

    return forwardRequest(`/api/v2/species/details/${id}`, new URLSearchParams(), res);
});

router.get('/diseases/:id', (req: any, res: any) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: 'Plant id is invalid' });
    }

    const query = new URLSearchParams({ id: id.toString() });
    const searchQuery = req.query.query?.toString();
    if (searchQuery) {
        query.set('query', searchQuery);
    }

    return forwardRequest('/api/pest-disease-list', query, res);
});

export default router;