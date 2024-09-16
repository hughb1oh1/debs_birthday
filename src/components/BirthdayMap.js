import React, { useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '400px' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, currentStep, onVenueClick }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const getMarkerIcon = useCallback((name) => ({
    url: `/venue-icons/${name.toLowerCase().replace(' ', '-')}.png`,
    scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
  }), [isLoaded]);

  const getMarkerAnimation = useCallback((index) => (
    isLoaded && index === currentStep ? window.google.maps.Animation.BOUNCE : null
  ), [isLoaded, currentStep]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
    >
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => onVenueClick(location)}
          icon={getMarkerIcon(location.name)}
          animation={getMarkerAnimation(index)}
        />
      ))}
      
      <Polyline
        path={locations.slice(0, currentStep + 1).map(loc => ({ lat: loc.lat, lng: loc.lng }))}
        options={{ strokeColor: "#FF0000" }}
      />
    </GoogleMap>
  );
};

export default BirthdayMap;