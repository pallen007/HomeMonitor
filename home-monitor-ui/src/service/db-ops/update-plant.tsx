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
        console.error("Error updating plant:", error);
    }
}