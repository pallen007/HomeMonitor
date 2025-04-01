// import PropTypes from "prop-types";
import React from 'react'
import { Card, ListGroupItem, ListGroup } from 'react-bootstrap';
import './plant.css'
import { PlantProps } from '../Types/types';
import { useTheme } from 'styled-components';
import { lightTheme } from "../../theme/theme";



const Plant: React.FC<PlantProps> = (
  props: PlantProps
) => {
  const theme = useTheme()
  const themeSwitch = theme === lightTheme ? "light" : "dark";

  return (
    <Card bg={themeSwitch}>
      <Card.Header></Card.Header>
      {props.localDetails?.plantImage && <Card.Img variant="top" src={`${props.localDetails?.plantImage}`} className="img-fluid"/>}
      <Card.Body>
        {props.owned ? <Card.Title>{props.localDetails.nickName}</Card.Title> : <Card.Title>{props.localDetails.realName}</Card.Title> }
        {props.owned && <Card.Subtitle>{props.localDetails.realName}</Card.Subtitle> }
        <Card.Text>Care: {props.localDetails.careInstructions}</Card.Text>
      </Card.Body>
      <ListGroup>
        {props.localDetails?.cycle && <ListGroupItem>
          Cycle: {props.localDetails?.cycle}
        </ListGroupItem>
        }
        {props.owned && <ListGroupItem>
          Current Moisture Level: {props.sensorData?.moistureLevel}
        </ListGroupItem>}
        {props.sensorData && <ListGroupItem>
          Ideal Moisture: {props.sensorData?.idealMoistureLevel}
        </ListGroupItem>}
        {props.sensorData && <ListGroupItem>
          Last watered {props.sensorData?.lastWatered}
        </ListGroupItem>}
      </ListGroup>
    </Card>
  );
};


export default React.memo(Plant);
