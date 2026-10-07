import React, { useEffect, useState } from 'react';
import { Button, CardGroup, Col, Form, Row } from 'react-bootstrap';
import { addPlantToCollection, DEMO_USER_ID, notifyCollectionUpdated } from '../../../service/db-ops/plant-ops';
import { plantSearch } from '../../../service/search/plant-search';
import { SearchOptions } from '../../../service/utils/types';
import Plant from '../plant/plant';
import { PlantProps } from '../Types/types';

const PlantLookup: React.FC = () => {
    const [filters, setFilters] = useState<SearchOptions>({
        query: '',
        order: 'asc',
        edible: null,
        poisonous: null,
        cycle: 'annual',
        watering: 'average',
        sunlight: 'full_sun',
        indoor: null,
        hardiness: 1,
    });
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const executeSearch = async () => {
        setLoading(true);
        try {
            const results: PlantProps[] = (await plantSearch(filters)) || [];
            setPlants(results);
        } catch (error) {
            console.error('Error fetching plants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async (plant: PlantProps) => {
        const plantId = plant.perenualId ?? plant.id ?? Date.now();
        const payload = {
            id: plantId,
            perenualId: plantId,
            nickName: plant.localDetails?.nickName || plant.localDetails?.realName || 'My Plant',
            userId: DEMO_USER_ID,
            idealMoistureLevel: 50,
            plantDetails: {
                common_name: plant.localDetails?.realName || 'Unknown plant',
                cycle: plant.localDetails?.cycle || 'annual',
                watering: plant.localDetails?.wateringRate || 'average',
                default_image: {
                    regular_url: plant.localDetails?.plantImage || '',
                    thumbnail: plant.localDetails?.plantThumbnail || '',
                },
            },
            wateringSchedule: {
                frequency: 3,
                lastWatered: new Date().toISOString(),
                nextWatering: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
            },
        };

        const createdPlant = await addPlantToCollection(payload, DEMO_USER_ID);
        if (createdPlant) {
            notifyCollectionUpdated();
            setPlants((currentPlants) =>
                currentPlants.filter((item) => (item.perenualId ?? item.id) !== (plant.perenualId ?? plant.id))
            );
        }
    };

    useEffect(() => {
        executeSearch();
    }, [filters]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Plant Lookup</h1>
            <Form>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Search Query</Form.Label>
                            <Form.Control
                                type="text"
                                name="query"
                                value={filters.query}
                                onChange={handleFilterChange}
                                placeholder="Enter plant name"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="primary" onClick={executeSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </Form>
            <div style={{ marginTop: '20px' }}>
                <h2>Results</h2>
                {plants.length === 0 && !loading && <p>No plants found.</p>}
                <CardGroup style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {plants.map((plant) => (
                        <Plant
                            {...plant}
                            key={plant.perenualId ?? plant.id ?? `${plant.localDetails?.realName}-lookup`}
                            onAddToCollection={handleAddToCollection}
                            isSearchResult={true}
                            owned={false}
                        />
                    ))}
                </CardGroup>
            </div>
        </div>
    );
};

export default PlantLookup;