import React, { useEffect, useState } from 'react';
import { Button, CardGroup, Col, Form, Row } from 'react-bootstrap';
import { addPlantToCollection, DEMO_USER_ID, notifyCollectionUpdated } from '../../../service/db-ops/plant-ops';
import { wikipediaPlantSearch } from '../../../service/search/plant-search';
import Plant from '../plant/plant';
import { PlantProps } from '../Types/types';

const RESULTS_PER_PAGE = 10;

const PlantLookup: React.FC = () => {
    const [query, setQuery] = useState('');
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);
    const pageCount = Math.ceil(plants.length / RESULTS_PER_PAGE);
    const visiblePlants = plants.slice(
        (currentPage - 1) * RESULTS_PER_PAGE,
        currentPage * RESULTS_PER_PAGE,
    );

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, Math.max(1, pageCount)));
    }, [pageCount]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setQuery(e.target.value);
    };

    const executeSearch = async (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setLoading(true);
        setSearchError(null);
        setCurrentPage(1);
        try {
            const results: PlantProps[] = await wikipediaPlantSearch(query);
            setPlants(results);
        } catch (error) {
            console.error('Error fetching plants:', error);
            setSearchError(error instanceof Error ? error.message : 'Plant search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async (plant: PlantProps) => {
        setAddError(null);
        const source = plant.wikipediaSource;
        if (!source) {
            setAddError('Wikipedia source details are missing. Search again before adding this plant.');
            return;
        }
        const plantId = Date.now();
        const payload = {
            id: plantId,
            nickName: plant.localDetails?.nickName || plant.localDetails?.realName || 'My Plant',
            userId: DEMO_USER_ID,
            idealMoistureLevel: 50,
            wikipediaSource: source,
            plantDetails: {
                common_name: plant.localDetails?.realName || 'Unknown plant',
                scientific_name: [],
                other_name: [],
                description: plant.localDetails?.plantDescription || '',
                ...(source.imageUrl ? {
                    default_image: {
                        regular_url: source.imageUrl,
                        thumbnail: source.imageUrl,
                    },
                } : {}),
            },
        };

        try {
            const createdPlant = await addPlantToCollection(payload, DEMO_USER_ID);
            if (createdPlant) {
                notifyCollectionUpdated();
                setPlants((currentPlants) => currentPlants.filter((item) => item.id !== plant.id));
            }
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Unable to add this plant.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Plant Lookup</h1>
            <Form onSubmit={executeSearch}>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Search Query</Form.Label>
                            <Form.Control
                                type="text"
                                name="query"
                                value={query}
                                onChange={handleFilterChange}
                                placeholder="Search Wikipedia for a plant"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </Form>
            <div style={{ marginTop: '20px' }}>
                <h2>Results</h2>
                {searchError && <p role="alert">Unable to search for plants: {searchError}</p>}
                {addError && <p role="alert">Unable to add this plant: {addError}</p>}
                {!searchError && plants.length === 0 && !loading && <p>No plants found.</p>}
                <p className="text-muted">
                    Search results use Wikipedia article text under CC BY-SA 4.0. Images are shown only when
                    Wikimedia Commons provides reusable license metadata.
                </p>
                <CardGroup style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {visiblePlants.map((plant) => (
                        <Plant
                            {...plant}
                            key={plant.id ?? `${plant.localDetails?.realName}-lookup`}
                            onAddToCollection={handleAddToCollection}
                            isSearchResult={true}
                            owned={false}
                        />
                    ))}
                </CardGroup>
                {pageCount > 1 && (
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-3">
                        <Button
                            variant="outline-primary"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {currentPage} of {pageCount}
                        </span>
                        <Button
                            variant="outline-primary"
                            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                            disabled={currentPage === pageCount}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlantLookup;