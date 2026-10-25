import React, { useState } from "react"
import { FaEdit } from 'react-icons/fa';
import { Modal, Button, Form } from "react-bootstrap"
import { PlantDetailsProps } from "./PlantDetailsProps";

// TODO: Update this whole file for new type structure
export const PlantDetailScreen = ( plant: PlantDetailsProps ) => {
  const [showModal, setShowModal] = useState(false)
  // TODO: This seems like an antipattern... Maybe make a new object and type?
  const [editablePlant, setEditablePlant] = useState<PlantDetailsProps>(plant)

  const handleEditClick = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditablePlant((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Save the updated plant details (e.g., send to API or update state)
    console.log("Updated Plant Details:", editablePlant)
    handleCloseModal()
  }

  const handleAddToCollection = () => {
    // TODO: Add logic to add the plant to the user's collection
    // Logic to add the plant to the user's collection
    console.log("Adding to collection:", editablePlant)
  }

  return (
    <div>
      <h1>Plant Details</h1>
      <ul>
        <li>Nickname: {plant.nickName}</li>
        <li>Real Name: {plant.realName}</li>
        <li>Care Instructions: {plant.careInstructions}</li>
        <li>Cycle: {plant.cycle}</li>
        <li>Ideal Moisture Level: {plant.idealMoistureLevel}</li>
        <li>Watering Rate: {plant.wateringRate}</li>
        <li>Image: {plant.plantImage && <img src={plant.plantImage} alt="Plant" />}</li>
      </ul>
      <Button onClick={handleEditClick}><FaEdit/>Edit Details</Button>
      {plant.isSearchResult && <Button onClick={handleAddToCollection}>Add to My Plants</Button>}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Plant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nickname</Form.Label>
              <Form.Control
                type="text"
                name="nickName"
                value={editablePlant.nickName || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Real Name</Form.Label>
              <Form.Control
                type="text"
                name="realName"
                value={editablePlant.realName || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Care Instructions</Form.Label>
              <Form.Control
                type="text"
                name="careInstructions"
                value={editablePlant.careInstructions || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Cycle</Form.Label>
              <Form.Control
                type="text"
                name="cycle"
                value={editablePlant.cycle || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ideal Moisture Level</Form.Label>
              <Form.Control
                type="number"
                name="idealMoistureLevel"
                value={editablePlant.idealMoistureLevel}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Watering Rate</Form.Label>
              <Form.Control
                type="text"
                name="wateringRate"
                value={editablePlant.wateringRate || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="plantImage"
                value={editablePlant.plantImage || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}