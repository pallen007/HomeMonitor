import { PerenualPlantDetails } from "../../service/utils/types"


export const getUserCollection = async (userId: string) => {
    const queryParams = new URLSearchParams({ userId })
    try {
        const response = await fetch(`http://localhost:5000/api/collection` + queryParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return response.json()
    }
    catch (error) {
        console.error("Error fetching user collection:", error)
    }
}


export const getPlants = async (idList: [number]) => {
    const queryParams = idList.join(',')
    try {
        const response = await fetch(`http://localhost:5000/api/plants` + queryParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return response.json()
    } catch (error) {
        console.error("Error fetching plants:", error)
    }
}

export const updatePlant = async (id: number, plantDetails: PerenualPlantDetails) => {
    try {
        const response = await fetch(`http://localhost:5000/api/plants/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantDetails)
        })
        return response.json()
    } catch (error) {
        console.error("Error updating plant:", error)
    }
}

export const getSensorData = async (idList: [number]) => {
    const queryParams = idList.join(',')
    try {
        const response = await fetch(`http://localhost:5000/api/sensor/` + queryParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return response.json()
    } catch (error) {
        console.error("Error fetching sensor data:", error)
    }
}