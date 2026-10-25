import { PerenualPlantDetails } from "../../service/utils/types"

export const DEMO_USER_ID = 'demo-user';

export const notifyCollectionUpdated = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('plant-collection-updated'));
    }
};

export const getUserCollection = async (userId: string = DEMO_USER_ID) => {
    try {
        const response = await fetch(`/api/plants/collection/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const collection = await response.json();
        if (!response.ok) {
            throw new Error(`API request failed (${response.status}): ${collection.error || response.statusText}`);
        }
        if (!Array.isArray(collection)) {
            throw new Error('API returned an invalid plant collection');
        }
        return collection;
    } catch (error) {
        console.error('Error fetching user collection:', error);
        throw error;
    }
};

export const addPlantToCollection = async (plant: Record<string, any>, userId: string = DEMO_USER_ID) => {
    const payload = {
        ...plant,
        userId,
    };

    try {
        const response = await fetch('/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const createdPlant = await response.json();
        if (!response.ok) {
            throw new Error(`API request failed (${response.status}): ${createdPlant.error || response.statusText}`);
        }
        notifyCollectionUpdated();
        return createdPlant;
    } catch (error) {
        console.error('Error creating plant:', error);
        throw error;
    }
};

export const getEnrichmentTasks = async (userId: string = DEMO_USER_ID) => {
    const response = await fetch(`/api/plants/enrichment-tasks/${encodeURIComponent(userId)}`);
    const tasks = await response.json();
    if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${tasks.error || response.statusText}`);
    }
    if (!Array.isArray(tasks)) {
        throw new Error('API returned invalid plant enrichment tasks');
    }
    return tasks;
};

export const resolveEnrichmentTask = async (
    plantId: number,
    userId: string = DEMO_USER_ID,
    selection: { searchTerm?: string; selectedPerenualId?: number },
) => {
    const response = await fetch(
        `/api/plants/enrichment-tasks/${encodeURIComponent(userId)}/${plantId}/resolve`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selection),
        },
    );
    const result = await response.json();
    if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${result.error || response.statusText}`);
    }
    return result;
};

export const deletePlantFromCollection = async (plantId: number, userId: string = DEMO_USER_ID) => {
    try {
        const response = await fetch(`/api/plants/${userId}/${plantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();
        notifyCollectionUpdated();
        return result;
    } catch (error) {
        console.error('Error deleting plant:', error);
    }
};

export const getSummaryStats = async (userId: string = DEMO_USER_ID) => {
    try {
        const response = await fetch(`/api/summary?userId=${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const summary = await response.json();
        if (!response.ok) {
            throw new Error(`API request failed (${response.status}): ${summary.error || response.statusText}`);
        }
        return summary;
    } catch (error) {
        console.error('Error fetching summary stats:', error);
        throw error;
    }
};

export const getPlants = async (idList: number[] = [], userId: string = DEMO_USER_ID) => {
    const ids = idList.length ? `?ids=${idList.join(',')}` : '';
    try {
        const response = await fetch(`/api/plants/collection/${userId}${ids}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching plants:', error);
    }
};

export const updatePlant = async (id: number, userId: string = DEMO_USER_ID, plantDetails: Partial<PerenualPlantDetails> & Record<string, any>) => {
    try {
        const response = await fetch(`/api/plants/${userId}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantDetails)
        });
        const result = await response.json();
        notifyCollectionUpdated();
        return result;
    } catch (error) {
        console.error('Error updating plant:', error);
    }
};

export const markPlantWatered = async (id: number, userId: string = DEMO_USER_ID) => {
    const plant = await getPlants([id], userId);
    const currentPlant = Array.isArray(plant) ? plant[0] : plant;

    if (!currentPlant) {
        return null;
    }

    const updatedPlant = {
        ...currentPlant,
        wateringSchedule: {
            ...(currentPlant.wateringSchedule || {}),
            lastWatered: new Date().toISOString(),
            nextWatering: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
    };

    return updatePlant(id, userId, updatedPlant);
};

export const getSensorData = async (idList: number[] = []) => {
    const queryParams = idList.length ? `?ids=${idList.join(',')}` : '';
    try {
        const response = await fetch(`/api/sensor${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
};