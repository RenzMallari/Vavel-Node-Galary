import React from "react";
import { compose, withProps } from "recompose";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const mapEnvironment = compose(
  withProps({
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withGoogleMap
);

const MapLayout = ({
  lat = -34.397,
  lng = 150.644,
  isMarkerShown = false,
  onMarkerClick = () => {}
}) => (
  <GoogleMap defaultZoom={16} defaultCenter={{ lat, lng }}>
    {isMarkerShown && (
      <Marker position={{ lat, lng }} onClick={onMarkerClick} />
    )}
  </GoogleMap>
);

const Map = mapEnvironment(MapLayout);

export default Map;
