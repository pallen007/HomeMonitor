import { PlantDetails } from "../../components/plants/model/types";

export const updatePlant = async (id: number, plantDetails: PlantDetails) => {
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

// export const getPlant = async (id: number) => {
//     try {
//         const response = await fetch(`http://localhost:5000/api/plant/${id}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         })
//         return response.json()
//     } catch (error) {
//         console.error("Error fetching plant:", error);
//     }
// }

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