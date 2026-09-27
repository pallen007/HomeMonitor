import { PerenualPlantDetails } from "../../service/utils/types"

export const DEMO_USER_ID = 'demo-user';

export const notifyCollectionUpdated = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('plant-collection-updated'));
    }
};

export const getUserCollection = async (userId: string = DEMO_USER_ID) => {
    try {
        const response = await fetch(`http://localhost:5000/api/plants/collection/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching user collection:', error);
    }
};

export const addPlantToCollection = async (plant: Record<string, any>, userId: string = DEMO_USER_ID) => {
    const payload = {
        ...plant,
        userId,
    };

    try {
        const response = await fetch('http://localhost:5000/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const createdPlant = await response.json();
        notifyCollectionUpdated();
        return createdPlant;
    } catch (error) {
        console.error('Error creating plant:', error);
    }
};

export const deletePlantFromCollection = async (plantId: number, userId: string = DEMO_USER_ID) => {
    try {
        const response = await fetch(`http://localhost:5000/api/plants/${userId}/${plantId}`, {
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
        const response = await fetch(`http://localhost:5000/api/summary?userId=${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching summary stats:', error);
    }
};

export const getPlants = async (idList: number[] = [], userId: string = DEMO_USER_ID) => {
    const ids = idList.length ? `?ids=${idList.join(',')}` : '';
    try {
        const response = await fetch(`http://localhost:5000/api/plants/collection/${userId}${ids}`, {
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
        const response = await fetch(`http://localhost:5000/api/plants/${userId}/${id}`, {
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
        const response = await fetch(`http://localhost:5000/api/sensor${queryParams}`, {
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