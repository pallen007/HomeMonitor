import React from "react"
// import { ThemeContext } from "styled-components"
// import { lightTheme } from "../../theme/theme"
import Plant from "../plant/plant"
import CardGroup from 'react-bootstrap/CardGroup' 
import { getPlants, getSensorData } from "../../../service/db-ops/plant-ops"
import { useEffect, useState } from "react"
import { PlantDetails, PlantProps, SensorData } from "../model/PlantDetails"

const PlantContainer = async (idList: [number]) => {
  const [plants, setPlants] = useState<PlantProps[]>([])

  const updateObjectInArray = (array, objectId, updateFields) => {
    return array.map((item) =>
      item.id === objectId ? { ...item, ...updateFields } : item
    );
  };
  
  const fetchPlants = async () => {
    try {
      const fetchedPlants: PlantDetails[] = await getPlants(idList);
      // update all plant objects for matching Ids
      fetchedPlants.forEach((plant) => {
        setPlants((plants) => updateObjectInArray(plants, plant.plantId, plant))
      })
    } catch (error) {
      console.error("Error fetching plant details:", error);
    }
  };

  const fetchSensorData = async () => {
    try {
      const fetchedSensorData: SensorData[] = await getSensorData(idList);
      fetchedSensorData.forEach((sensorData) => {
        setPlants((plants) => updateObjectInArray(plants, sensorData.plantId, sensorData))
      })
    } catch (error) {
      console.error("Error fetching sensor data:", error)
    }
  }

  useEffect(() => {
    fetchPlants()
    fetchSensorData()
  }, [idList])

  return (
    <div>
      <CardGroup>
        {plants.map((plantItem, index) => {
          return <Plant {...plantItem} key={index} />
        })}
      </CardGroup>
    </div>
  )
}
export default PlantContainer;