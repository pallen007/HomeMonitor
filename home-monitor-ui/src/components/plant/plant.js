// import PropTypes from "prop-types";
import React from 'react'
import {Image, ScrollView, Text} from 'react-native';
import { Card, ListGroupItem, ListGroup } from 'react-bootstrap';
import './plant.css'

function Plant(props) {


  // Handlers
  const handleEdits = (event) => {

  }


  // Actions



  return (
    <Card bg={props.theme} key={props.index}>
      <Card.Header></Card.Header>
      <Card.Img variant="top" src={`${process.env.PUBLIC_URL}/${props.details.plantImage}`} className="img-fluid"/>
      <Card.Body>
        <Card.Title>{props.details.nickName}</Card.Title>
        <Card.Subtitle>{props.details.realName}</Card.Subtitle>
        <Card.Text>Care: {props.details.careInstructions}</Card.Text>
      </Card.Body>
      <ListGroup>
        <ListGroupItem>
          Current Moisture Level: {true && props.details.moistureLevel}
          Ideal Moisture: {true && props.details.idealMoistureLevel}
        </ListGroupItem>
        <ListGroupItem>
          Last watered {true && props.details.lastWatered}
        </ListGroupItem>
      </ListGroup>
    </Card>
  );
};

// Plant.propTypes = {
//   theme: String,
//   plantImage: String,
//   nickName: String,
//   realName: String,
//   moistureLevel: Number,
//   idealMoistureLevel: Number,
//   lastWatered: Date,
//   careInstructions: String,
// };

export default Plant;
