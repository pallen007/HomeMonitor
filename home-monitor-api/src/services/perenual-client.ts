import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const getPerenualApiKey = (): string | undefined => {
    if (process.env.PERENUAL_API_KEY?.trim()) {
        return process.env.PERENUAL_API_KEY.trim();
    }

    const credentialsPath = [
        path.resolve(process.cwd(), 'credentials.json'),
        path.resolve(__dirname, '../../credentials.json'),
        '/app/credentials.json',
    ].find((candidate) => existsSync(candidate));
    if (!credentialsPath) {
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

export const fetchPerenual = async (pathName: string, query: URLSearchParams): Promise<Response> => {
    const apiKey = getPerenualApiKey();
    if (!apiKey) {
        throw new Error('Perenual API is not configured');
    }

    query.set('key', apiKey);
    const url = new URL(pathName, 'https://perenual.com/');
    url.search = query.toString();
    return fetch(url, { signal: AbortSignal.timeout(15_000) });
};
