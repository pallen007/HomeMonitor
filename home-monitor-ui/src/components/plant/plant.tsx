// import PropTypes from "prop-types";
import React from 'react'
import {Image, ScrollView, Text} from 'react-native';
import { Card, ListGroupItem, ListGroup } from 'react-bootstrap';
import './plant.css'

interface PlantProps {
  id: number
  parenualId?: number
  details: {
    careInstructions?: string;
    cycle?: string;
    idealMoistureLevel: number;
    lastWatered?: string;
    moistureLevel?: number;
    nickName?: string;
    plantImage?: string;
    realName?: string;
    wateringRate?: string;
  };
}

const Plant: React.FC<PlantProps> = ({
  id,
  parenualId,
  details: {
    careInstructions,
    cycle,  
    idealMoistureLevel,
    lastWatered,
    moistureLevel,
    nickName,
    plantImage,
    realName,
    wateringRate
  }
}: PlantProps) => {


  // Handlers
  const handleEdits = (event) => {
    // update plant's details manually
  }


  // Actions
const handleUpdate = (event) => {
  // Update the plant's details, potentially by searching the parentual API in a modal
} 


  return (
    <Card bg={theme} key={id}>
      <Card.Header></Card.Header>
      <Card.Img variant="top" src={`${process.env.PUBLIC_URL}/${plantImage}`} className="img-fluid"/>
      <Card.Body>
        <Card.Title>{nickName}</Card.Title>
        <Card.Subtitle>{realName}</Card.Subtitle>
        <Card.Text>Care: {careInstructions}</Card.Text>
      </Card.Body>
      <ListGroup>
        {cycle && <ListGroupItem>
          Cycle: {cycle}
        </ListGroupItem>
        }
        <ListGroupItem>
          Current Moisture Level: {moistureLevel}
          Ideal Moisture: {idealMoistureLevel}
        </ListGroupItem>
        <ListGroupItem>
          Last watered {lastWatered}
        </ListGroupItem>
      </ListGroup>
    </Card>
  );
};


export default Plant;
