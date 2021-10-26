// import PropTypes from "prop-types";
import { Card, ListGroupItem, ListGroup } from 'react-bootstrap';
import './plant.css'

function Plant(props) {
  return (
    <Card bg={props.theme} key={props.index}>
      <Card.Img variant="top" src={`${process.env.PUBLIC_URL}/${props.details.plantImage}`} className="img-fluid"/>
      <Card.Body>
        <Card.Title>{props.details.nickName}</Card.Title>
        <Card.Subtitle>{props.details.realName}</Card.Subtitle>
        <Card.Text>Care: {props.details.careInstructions}</Card.Text>
      </Card.Body>
      <ListGroup>
        <ListGroupItem>
          Current Moisture Level: {props.details.moistureLevel}
        </ListGroupItem>
        <ListGroupItem>
            Last watered {props.details.lastWatered}
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
//   lastWatered: Date,
//   careInstructions: String,
// };

export default Plant;
