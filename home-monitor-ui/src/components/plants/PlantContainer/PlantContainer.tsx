import React, { useEffect, useState } from 'react';
import { Button, Card, CardGroup, Form } from 'react-bootstrap';
import {
    DEMO_USER_ID,
    deletePlantFromCollection,
    getEnrichmentTasks,
    getSensorData,
    getUserCollection,
    markPlantWatered,
    notifyCollectionUpdated,
    resolveEnrichmentTask,
} from '../../../service/db-ops/plant-ops';
import Plant from '../plant/plant';
import { PlantProps, SensorData } from '../Types/types';

const PlantContainer: React.FC = () => {
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [enrichmentTasks, setEnrichmentTasks] = useState<any[]>([]);
    const [clarifications, setClarifications] = useState<Record<number, string>>({});
    const [taskError, setTaskError] = useState<string | null>(null);
    const [submittingTask, setSubmittingTask] = useState<number | null>(null);

    const normalizePlant = (plant: any, sensorMap: Map<number, SensorData>) => {
        const sensor = sensorMap.get(plant.id);
        const wikipediaSource = plant.wikipediaSource;
        return {
            id: plant.id,
            perenualId: plant.perenualId ?? plant.plantDetails?.perenualId,
            enrichmentStatus: plant.enrichment?.status,
            owned: true,
            isSearchResult: false,
            wikipediaSource,
            localDetails: {
                perenualId: plant.perenualId ?? plant.plantDetails?.perenualId,
                nickName: plant.nickName || plant.plantDetails?.common_name || 'My Plant',
                realName: wikipediaSource?.title || plant.plantDetails?.common_name || plant.nickName || 'My Plant',
                plantDescription: plant.plantDetails?.description || wikipediaSource?.summary,
                cycle: plant.plantDetails?.cycle,
                scientificName: plant.plantDetails?.scientific_name?.join(', '),
                plantImage: wikipediaSource?.imageUrl,
                plantThumbnail: wikipediaSource?.imageUrl,
                wateringRate: plant.plantDetails?.watering,
                wikipediaPageId: wikipediaSource?.pageId,
                wikipediaArticleUrl: wikipediaSource?.articleUrl,
                wikipediaTextLicense: wikipediaSource?.textLicense,
                wikipediaTextLicenseUrl: wikipediaSource?.textLicenseUrl,
                imageSourceUrl: wikipediaSource?.imageSourceUrl,
                imageAttribution: wikipediaSource?.imageAttribution,
                imageLicense: wikipediaSource?.imageLicense,
                imageLicenseUrl: wikipediaSource?.imageLicenseUrl,
            },
            sensorData: sensor
                ? {
                    plantId: plant.id,
                    idealMoistureLevel: plant.idealMoistureLevel ?? sensor.idealMoistureLevel ?? 50,
                    moistureLevel: sensor.moistureLevel,
                    lastWatered: sensor.timestamp || plant.wateringSchedule?.lastWatered,
                    timestamp: sensor.timestamp,
                  }
                : undefined,
        } as PlantProps;
    };

    const fetchCollection = async () => {
        try {
            const [collection, tasks] = await Promise.all([
                getUserCollection(DEMO_USER_ID),
                getEnrichmentTasks(DEMO_USER_ID),
            ]);
            const ids = collection.map((plant: any) => plant.id).filter(Boolean);
            const sensorRows: SensorData[] = ids.length ? (await getSensorData(ids)) || [] : [];
            const sensorMap = new Map<number, SensorData>(sensorRows.map((row) => [row.plantId, row]));
            setPlants(collection.map((plant: any) => normalizePlant(plant, sensorMap)));
            setEnrichmentTasks(tasks);
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    };

    const handleResolveTask = async (
        plantId: number,
        selection: { searchTerm?: string; selectedPerenualId?: number },
    ) => {
        setTaskError(null);
        setSubmittingTask(plantId);
        try {
            await resolveEnrichmentTask(plantId, DEMO_USER_ID, selection);
            await fetchCollection();
        } catch (error) {
            setTaskError(error instanceof Error ? error.message : 'Unable to update plant care data task.');
        } finally {
            setSubmittingTask(null);
        }
    };

    const handleRemoveFromCollection = async (plantId?: number) => {
        if (!plantId) return;
        await deletePlantFromCollection(plantId, DEMO_USER_ID);
        notifyCollectionUpdated();
        await fetchCollection();
    };

    const handleMarkWatered = async (plantId?: number) => {
        if (!plantId) return;
        await markPlantWatered(plantId, DEMO_USER_ID);
        notifyCollectionUpdated();
        await fetchCollection();
    };

    useEffect(() => {
        fetchCollection();

        const handleCollectionChange = () => {
            fetchCollection();
        };

        window.addEventListener('plant-collection-updated', handleCollectionChange);

        return () => {
            window.removeEventListener('plant-collection-updated', handleCollectionChange);
        };
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Plants</h1>
            {enrichmentTasks.length > 0 && (
                <section aria-labelledby="plant-enrichment-heading" className="mb-4">
                    <h2 id="plant-enrichment-heading">Help match plant care data</h2>
                    <p>
                        A close Perenual match was not certain. Choose the correct species or enter a
                        clearer common or scientific name. Your choice will be checked during the next
                        scheduled enrichment run.
                    </p>
                    {taskError && <p role="alert">{taskError}</p>}
                    {enrichmentTasks.map((task) => (
                        <Card key={task.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>
                                    {task.wikipediaSource?.title || task.plantDetails?.common_name || task.nickName}
                                </Card.Title>
                                <Card.Text>{task.enrichment?.message}</Card.Text>
                                {task.enrichment?.candidates?.map((candidate: any) => (
                                    <Button
                                        key={candidate.id}
                                        variant="outline-primary"
                                        className="me-2 mb-2"
                                        disabled={submittingTask === task.id}
                                        onClick={() => handleResolveTask(task.id, { selectedPerenualId: candidate.id })}
                                    >
                                        {candidate.common_name || candidate.scientific_name?.[0] || `Species ${candidate.id}`}
                                        {candidate.scientific_name?.[0] && candidate.common_name
                                            ? ` (${candidate.scientific_name[0]})`
                                            : ''}
                                    </Button>
                                ))}
                                <Form
                                    className="d-flex gap-2 mt-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        void handleResolveTask(task.id, {
                                            searchTerm: clarifications[task.id] || task.enrichment?.searchTerm,
                                        });
                                    }}
                                >
                                    <Form.Control
                                        aria-label={`Clarify plant name for ${task.wikipediaSource?.title || task.nickName}`}
                                        value={clarifications[task.id] ?? task.enrichment?.searchTerm ?? ''}
                                        onChange={(event) => setClarifications((current) => ({
                                            ...current,
                                            [task.id]: event.target.value,
                                        }))}
                                    />
                                    <Button type="submit" disabled={submittingTask === task.id}>
                                        Search this name
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ))}
                </section>
            )}
            <CardGroup style={{ display: 'flex', flexWrap: 'wrap' }}>
                {plants.length === 0 ? (
                    <p>No plants in your collection yet.</p>
                ) : (
                    plants.map((plantItem) => (
                        <Plant
                            {...plantItem}
                            key={plantItem.id ?? plantItem.perenualId ?? plantItem.localDetails?.realName}
                            onRemoveFromCollection={handleRemoveFromCollection}
                            onMarkWatered={handleMarkWatered}
                        />
                    ))
                )}
            </CardGroup>
        </div>
    );
};

export default PlantContainer;
