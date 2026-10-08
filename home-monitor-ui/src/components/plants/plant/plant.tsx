import React from 'react';
import { Button, Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { useTheme } from 'styled-components';
import './plant.css';
import { PlantProps } from '../Types/types';
import { lightTheme } from '../../theme/theme';

const Plant: React.FC<PlantProps> = (props: PlantProps) => {
  const theme = useTheme();
  const themeSwitch = theme === lightTheme ? 'light' : 'dark';

  const title = props.owned
    ? props.localDetails?.nickName || 'Unnamed plant'
    : props.localDetails?.realName || 'Plant lookup';

  const subtitle = props.owned ? props.localDetails?.realName || 'Plant' : null;
  const careText = props.localDetails?.careInstructions || 'No care instructions yet.';
  const image = props.localDetails?.plantImage || props.localDetails?.plantThumbnail;

  const handleAdd = async () => {
    if (props.onAddToCollection) {
      await props.onAddToCollection(props);
    }
  };

  const handleRemove = async () => {
    if (props.onRemoveFromCollection) {
      await props.onRemoveFromCollection(props.id);
    }
  };

  const handleWater = async () => {
    if (props.onMarkWatered) {
      await props.onMarkWatered(props.id);
    }
  };

  return (
    <Card bg={themeSwitch} style={{ width: '18rem', margin: '12px' }}>
      {image && <Card.Img variant="top" src={image} className="img-fluid" />}
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        <Card.Text>Care: {careText}</Card.Text>
      </Card.Body>
      <ListGroup>
        {props.localDetails?.cycle && (
          <ListGroupItem>Cycle: {props.localDetails.cycle}</ListGroupItem>
        )}
        {props.owned && (
          <ListGroupItem>
            Current Moisture Level: {props.sensorData?.moistureLevel ?? 'No data'}
          </ListGroupItem>
        )}
        {props.sensorData && (
          <ListGroupItem>
            Ideal Moisture: {props.sensorData?.idealMoistureLevel ?? 'Not set'}
          </ListGroupItem>
        )}
        {props.sensorData && (
          <ListGroupItem>
            Last watered {props.sensorData?.lastWatered || 'Unknown'}
          </ListGroupItem>
        )}
      </ListGroup>
      <Card.Body>
        {props.isSearchResult && (
          <Button variant="primary" onClick={handleAdd}>
            Add to My Plants
          </Button>
        )}
        {props.owned && (
          <>
            <Button variant="success" onClick={handleWater} className="me-2">
              Mark Watered
            </Button>
            <Button variant="outline-danger" onClick={handleRemove}>
              Remove
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default React.memo(Plant);
