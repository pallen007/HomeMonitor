import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantLookup from './PlantLookup';
import { wikipediaPlantSearch } from '../../../service/search/plant-search';
import { addPlantToCollection } from '../../../service/db-ops/plant-ops';
import { lightTheme } from '../../theme/theme';

vi.mock('../../../service/search/plant-search', () => ({
    wikipediaPlantSearch: vi.fn(),
}));

vi.mock('../../../service/db-ops/plant-ops', () => ({
    addPlantToCollection: vi.fn(),
    DEMO_USER_ID: 'demo-user',
    notifyCollectionUpdated: vi.fn(),
}));

describe('PlantLookup pagination', () => {
    beforeEach(() => {
        vi.mocked(wikipediaPlantSearch).mockResolvedValue(
            Array.from({ length: 21 }, (_, index) => ({
                id: index + 1,
                localDetails: { realName: `Plant ${index + 1}` },
            })),
        );
        vi.mocked(addPlantToCollection).mockResolvedValue({});
    });

    it('shows ten results per page and paginates the remaining results', async () => {
        render(
            <ThemeProvider theme={lightTheme}>
                <PlantLookup />
            </ThemeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Search' }));
        expect(await screen.findByText('Plant 10')).toBeInTheDocument();
        expect(screen.queryByText('Plant 11')).not.toBeInTheDocument();
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(await screen.findByText('Plant 11')).toBeInTheDocument();
        expect(screen.queryByText('Plant 1', { exact: true })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await waitFor(() => expect(screen.getByText('Plant 21')).toBeInTheDocument());
        expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    });

    it('adds a Wikipedia result with its source and licensing metadata', async () => {
        const result = {
            id: 123,
            localDetails: {
                realName: 'Monstera deliciosa',
                plantDescription: 'A tropical plant.',
                wikipediaArticleUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
                wikipediaTextLicense: 'CC BY-SA 4.0',
                wikipediaTextLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
            },
            wikipediaSource: {
                pageId: 123,
                title: 'Monstera deliciosa',
                articleUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
                summary: 'A tropical plant.',
                textLicense: 'CC BY-SA 4.0',
                textLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
            },
        };
        vi.mocked(wikipediaPlantSearch).mockResolvedValue([result]);

        render(
            <ThemeProvider theme={lightTheme}>
                <PlantLookup />
            </ThemeProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Search' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Add to My Plants' }));

        await waitFor(() => expect(addPlantToCollection).toHaveBeenCalledWith(
            expect.objectContaining({
                wikipediaSource: result.wikipediaSource,
                plantDetails: expect.objectContaining({ common_name: 'Monstera deliciosa' }),
            }),
            'demo-user',
        ));
    });
});
