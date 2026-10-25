import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantContainer from './PlantContainer';
import {
    getEnrichmentTasks,
    getSensorData,
    getUserCollection,
    resolveEnrichmentTask,
} from '../../../service/db-ops/plant-ops';

vi.mock('../../../service/db-ops/plant-ops', () => ({
    DEMO_USER_ID: 'demo-user',
    deletePlantFromCollection: vi.fn(),
    getEnrichmentTasks: vi.fn(),
    getSensorData: vi.fn(),
    getUserCollection: vi.fn(),
    markPlantWatered: vi.fn(),
    notifyCollectionUpdated: vi.fn(),
    resolveEnrichmentTask: vi.fn(),
}));

const task = {
    id: 17,
    nickName: 'My Monstera',
    wikipediaSource: { title: 'Monstera deliciosa' },
    enrichment: {
        message: 'Choose the matching plant.',
        searchTerm: 'Monstera deliciosa',
        candidates: [{
            id: 42,
            common_name: 'Swiss cheese plant',
            scientific_name: ['Monstera deliciosa'],
            score: 1,
        }],
    },
};

describe('PlantContainer enrichment clarification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserCollection).mockResolvedValue([]);
        vi.mocked(getSensorData).mockResolvedValue([]);
        vi.mocked(resolveEnrichmentTask).mockResolvedValue({ queued: true });
        vi.mocked(getEnrichmentTasks).mockResolvedValue([task]);
    });

    it('lets the user choose a suggested Perenual species match', async () => {
        vi.mocked(getEnrichmentTasks)
            .mockResolvedValueOnce([task])
            .mockResolvedValueOnce([]);

        render(<PlantContainer />);
        fireEvent.click(await screen.findByRole('button', { name: /Swiss cheese plant/ }));

        await waitFor(() => expect(resolveEnrichmentTask).toHaveBeenCalledWith(
            17,
            'demo-user',
            { selectedPerenualId: 42 },
        ));
    });

    it('lets the user correct the search name and queue another match attempt', async () => {
        vi.mocked(getEnrichmentTasks)
            .mockResolvedValueOnce([task])
            .mockResolvedValueOnce([]);

        render(<PlantContainer />);
        const clarification = await screen.findByRole('textbox', {
            name: 'Clarify plant name for Monstera deliciosa',
        });
        fireEvent.change(clarification, { target: { value: 'Monstera deliciosa variegata' } });
        fireEvent.click(screen.getByRole('button', { name: 'Search this name' }));

        await waitFor(() => expect(resolveEnrichmentTask).toHaveBeenCalledWith(
            17,
            'demo-user',
            { searchTerm: 'Monstera deliciosa variegata' },
        ));
    });
});
