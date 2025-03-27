// import PropTypes from "prop-types";
import React from 'react'
import { Card, ListGroupItem, ListGroup } from 'react-bootstrap';
import './plant.css'
import { PlantProps } from '../model/types';
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
      {props.details?.plantImage && <Card.Img variant="top" src={`data:image/png;base64,${props.details?.plantImage}`} className="img-fluid"/>}
      <Card.Body>
        {props.owned ? <Card.Title>{props.details.nickName}</Card.Title> : <Card.Title>{props.details.realName}</Card.Title> }
        {props.owned && <Card.Subtitle>{props.details.realName}</Card.Subtitle> }
        <Card.Text>Care: {props.details.careInstructions}</Card.Text>
      </Card.Body>
      <ListGroup>
        {props.details?.cycle && <ListGroupItem>
          Cycle: {props.details?.cycle}
        </ListGroupItem>
        }
        {props.owned && <ListGroupItem>
          Current Moisture Level: {props.sensorData?.moistureLevel}
        </ListGroupItem>}
        <ListGroupItem>
          Ideal Moisture: {props.details.idealMoistureLevel}
        </ListGroupItem>
        {props.owned && <ListGroupItem>
          Last watered {props.sensorData?.lastWatered}
        </ListGroupItem>}
      </ListGroup>
    </Card>
  );
};


export default React.memo(Plant);
