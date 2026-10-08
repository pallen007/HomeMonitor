import React, { useEffect, useState } from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import {
    DEMO_USER_ID,
    deletePlantFromCollection,
    getSensorData,
    getUserCollection,
    markPlantWatered,
    notifyCollectionUpdated,
} from '../../../service/db-ops/plant-ops';
import Plant from '../plant/plant';
import { PlantProps, SensorData } from '../Types/types';

const PlantContainer: React.FC = () => {
    const [plants, setPlants] = useState<PlantProps[]>([]);

    const normalizePlant = (plant: any, sensorMap: Map<number, SensorData>) => {
        const sensor = sensorMap.get(plant.id);
        return {
            id: plant.id,
            perenualId: plant.perenualId ?? plant.plantDetails?.perenualId ?? plant.id,
            owned: true,
            isSearchResult: false,
            localDetails: {
                perenualId: plant.perenualId ?? plant.id,
                nickName: plant.nickName || plant.plantDetails?.common_name || 'My Plant',
                realName: plant.plantDetails?.common_name || plant.nickName || 'My Plant',
                careInstructions: plant.plantDetails?.watering || 'Check your plant regularly.',
                cycle: plant.plantDetails?.cycle,
                plantImage: plant.plantDetails?.default_image?.regular_url || plant.plantDetails?.default_image?.thumbnail,
                plantThumbnail: plant.plantDetails?.default_image?.thumbnail,
                wateringRate: plant.plantDetails?.watering || 'average',
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
            const collection = (await getUserCollection(DEMO_USER_ID)) || [];
            const ids = collection.map((plant: any) => plant.id).filter(Boolean);
            const sensorRows: SensorData[] = ids.length ? (await getSensorData(ids)) || [] : [];
            const sensorMap = new Map<number, SensorData>(sensorRows.map((row) => [row.plantId, row]));
            setPlants(collection.map((plant: any) => normalizePlant(plant, sensorMap)));
        } catch (error) {
            console.error('Error fetching collection:', error);
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
