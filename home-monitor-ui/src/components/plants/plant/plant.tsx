import React, { useState } from 'react';
import { Button, Card, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import './plant.css';
import { PlantProps } from '../Types/types';

const Plant: React.FC<PlantProps> = (props: PlantProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const imageSources = Array.from(new Set([
    ...(props.localDetails?.plantImageFallbacks || []),
    props.localDetails?.plantImage,
    props.localDetails?.plantThumbnail,
  ].filter((source): source is string => Boolean(source))));
  const [imageIndex, setImageIndex] = useState(0);
  const title = props.owned
    ? props.localDetails?.nickName || 'Unnamed plant'
    : props.localDetails?.realName || 'Plant lookup';

  const subtitle = props.owned ? props.localDetails?.realName || 'Plant' : null;
  const description = props.localDetails?.plantDescription;
  const image = imageSources[imageIndex];

  const handleAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (props.onAddToCollection) {
      await props.onAddToCollection(props);
    }
  };

  const handleShowDetails = () => {
    setShowDetails(true);
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
        {description && <Card.Text>{description}</Card.Text>}
        {props.localDetails?.wikipediaArticleUrl && (
          <small>
            Text from Wikipedia contributors (
            <a href={`${props.localDetails.wikipediaArticleUrl}?action=history`} target="_blank" rel="noreferrer">
              history
            </a>
            ): <a href={props.localDetails.wikipediaArticleUrl} target="_blank" rel="noreferrer">
              {props.localDetails.realName || 'article'}
            </a>
            {props.localDetails.wikipediaTextLicense && <> · licensed under <a
              href={props.localDetails.wikipediaTextLicenseUrl}
              target="_blank"
              rel="noreferrer"
            >{props.localDetails.wikipediaTextLicense}</a> (excerpt shortened)</>}
          </small>
        )}
        {image && props.localDetails?.imageSourceUrl && (
          <small className="d-block mt-2">
            Image attribution: {props.localDetails.imageAttribution || 'Wikimedia Commons'}
            {props.localDetails.imageSourceUrl && <> · <a
              href={props.localDetails.imageSourceUrl}
              target="_blank"
              rel="noreferrer"
            >image source</a></>}
            {props.localDetails.imageLicense && <> · <a
              href={props.localDetails.imageLicenseUrl}
              target="_blank"
              rel="noreferrer"
            >{props.localDetails.imageLicense}</a></>}
          </small>
        )}
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
        {props.owned && props.localDetails?.wateringRate && (
          <ListGroupItem>
            Watering guidance: {props.localDetails.wateringRate} (Perenual; verify for your conditions)
          </ListGroupItem>
        )}
        {props.owned && props.localDetails?.scientificName && (
          <ListGroupItem>Scientific name: {props.localDetails.scientificName}</ListGroupItem>
        )}
        {props.owned && ['pending', 'processing'].includes(props.enrichmentStatus || '') && (
          <ListGroupItem>Plant care data is being matched in the background.</ListGroupItem>
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
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {image && <img src={image} alt={title} className="img-fluid mb-3" />}
          {description && <p>{description}</p>}
          <p>
            General information only—not plant-care advice. Care information is added later when a
            reliable species match is available.
          </p>
          {props.localDetails?.wikipediaArticleUrl && (
            <p>
              Text from Wikipedia contributors (
              <a href={`${props.localDetails.wikipediaArticleUrl}?action=history`} target="_blank" rel="noreferrer">
                history
              </a>
              ). Article: <a href={props.localDetails.wikipediaArticleUrl} target="_blank" rel="noreferrer">{title}</a>
              {' '}· licensed under <a href={props.localDetails.wikipediaTextLicenseUrl} target="_blank" rel="noreferrer">
                {props.localDetails.wikipediaTextLicense}
              </a>. Excerpt shortened.
            </p>
          )}
          {image && props.localDetails?.imageSourceUrl && (
            <p>
              Image by {props.localDetails.imageAttribution || 'Wikimedia Commons'};{' '}
              <a href={props.localDetails.imageSourceUrl} target="_blank" rel="noreferrer">source</a>
              {props.localDetails.imageLicense && <> · <a
                href={props.localDetails.imageLicenseUrl}
                target="_blank"
                rel="noreferrer"
              >{props.localDetails.imageLicense}</a></>}
            </p>
          )}
        </Modal.Body>
      </Modal>
    )}
    </>
  );
};

export default React.memo(Plant);
