import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, CardGroup } from 'react-bootstrap'
import { plantSearch } from '../../../service/search/plant-search'
import { SearchOptions } from '../../../service/utils/types'
import Plant from '../plant/plant'
import { PlantProps } from '../types/types'


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
    const [plants, setPlants] = useState<PlantProps[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }))
    }

    const executeSearch = async () => {
        setLoading(true);
        try {
            const results: PlantProps[] = (await plantSearch(filters)) || []
            setPlants(results)
        } catch (error) {
            console.error('Error fetching plants:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        executeSearch()
    }, [filters])

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
                    {/* 
                    // TODO: update with actual filters and sorting logic
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
                    </Col> */}
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
                        <Plant {...plant} key={plant.perenualId} />
                        
                    ))}
                </CardGroup>
            </div>
        </div>
    );
};

export default PlantLookup