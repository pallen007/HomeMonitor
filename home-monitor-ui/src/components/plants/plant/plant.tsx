import React, { useState } from 'react';
import { Button, Card, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import { useTheme } from 'styled-components';
import './plant.css';
import { PlantProps } from '../Types/types';
import { lightTheme } from '../../theme/theme';
import { detailSearch } from '../../../service/search/plant-search';
import { PerenualPlantDetails } from '../../../service/utils/types';

const Plant: React.FC<PlantProps> = (props: PlantProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<PerenualPlantDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const imageSources = Array.from(new Set([
    ...(props.localDetails?.plantImageFallbacks || []),
    props.localDetails?.plantImage,
    props.localDetails?.plantThumbnail,
  ].filter((source): source is string => Boolean(source))));
  const [imageIndex, setImageIndex] = useState(0);
  const theme = useTheme();
  const themeSwitch = theme === lightTheme ? 'light' : 'dark';

  const title = props.owned
    ? props.localDetails?.nickName || 'Unnamed plant'
    : props.localDetails?.realName || 'Plant lookup';

  const subtitle = props.owned ? props.localDetails?.realName || 'Plant' : null;
  const careText = props.localDetails?.careInstructions || 'No care instructions yet.';
  const image = imageSources[imageIndex];

  const handleAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (props.onAddToCollection) {
      await props.onAddToCollection(props);
    }
  };

  const handleShowDetails = async () => {
    setShowDetails(true);
    if (details || detailsLoading) {
      return;
    }

    const plantId = props.perenualId ?? props.id;
    if (!plantId) {
      setDetailsError('Plant details are unavailable because this result has no plant ID.');
      return;
    }

    setDetailsLoading(true);
    setDetailsError(null);
    try {
      setDetails(await detailSearch(plantId));
    } catch (error) {
      setDetailsError(error instanceof Error ? error.message : 'Unable to load plant details.');
    } finally {
      setDetailsLoading(false);
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
    <>
    <Card
      bg={themeSwitch}
      style={{ width: '18rem', margin: '12px', cursor: props.isSearchResult ? 'pointer' : undefined }}
      onClick={props.isSearchResult ? handleShowDetails : undefined}
    >
      {image && (
        <Card.Img
          variant="top"
          src={image}
          className="img-fluid"
          onError={() => setImageIndex((index) => index + 1)}
        />
      )}
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
    {props.isSearchResult && (
      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{details?.common_name || title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading && <p>Loading plant details...</p>}
          {detailsError && <p role="alert">{detailsError}</p>}
          {details && (
            <>
              {details.default_image?.regular_url && (
                <img
                  src={details.default_image.regular_url}
                  alt={details.common_name || title}
                  className="img-fluid mb-3"
                />
              )}
              {details.scientific_name?.length ? (
                <p>Scientific name: {details.scientific_name.join(', ')}</p>
              ) : null}
              {details.description && <p>{details.description}</p>}
              {details.cycle && <p>Cycle: {details.cycle}</p>}
              {details.watering && <p>Watering: {details.watering}</p>}
              {details.sunlight?.length ? <p>Sunlight: {details.sunlight.join(', ')}</p> : null}
            </>
          )}
        </Modal.Body>
      </Modal>
    )}
    </>
  );
};

export default React.memo(Plant);
