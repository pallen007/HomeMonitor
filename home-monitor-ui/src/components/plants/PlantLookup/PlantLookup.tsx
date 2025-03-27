import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { plantSearch } from '../../../service/search/plant-search'; // Import the plant-search service
import { SearchOptions } from '../../../service/utils/types'; // Import the SearchOptions type

interface Plant {
    id: number;
    name: string;
    image: string;
    description: string;
}

const PlantLookup: React.FC = () => {
    const [filters, setFilters] = useState<SearchOptions>({
        key: '',
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
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const executeSearch = async () => {
        setLoading(true);
        try {
            const results = await plantSearch(filters); // Call the plant-search service
            setPlants(results);
        } catch (error) {
            console.error('Error fetching plants:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        executeSearch(); // Execute search whenever filters change
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
                    <Col>
                        <Form.Group>
                            <Form.Label>Order</Form.Label>
                            <Form.Select
                                name="order"
                                value={filters.order}
                                onChange={handleFilterChange}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Cycle</Form.Label>
                            <Form.Select
                                name="cycle"
                                value={filters.cycle}
                                onChange={handleFilterChange}
                            >
                                <option value="annual">Annual</option>
                                <option value="perennial">Perennial</option>
                                <option value="biennial">Biennial</option>
                                <option value="biannual">Biannual</option>
                            </Form.Select>
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
                <Row>
                    {plants.map((plant) => (
                        <Col key={plant.id} md={4} style={{ marginBottom: '20px' }}>
                            <Card>
                                <Card.Img variant="top" src={plant.image} alt={plant.name} />
                                <Card.Body>
                                    <Card.Title>{plant.name}</Card.Title>
                                    <Card.Text>{plant.description}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default PlantLookup;