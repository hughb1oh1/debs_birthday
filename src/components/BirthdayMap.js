import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, currentStep, onVenueClick }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const [animatedPositions, setAnimatedPositions] = useState([]);

  const getMarkerIcon = useCallback((name) => ({
    url: `/venue-icons/${name.toLowerCase().replace(' ', '-')}.png`,
    scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
  }), [isLoaded]);

  const getMarkerAnimation = useCallback((index) => (
    isLoaded && index === currentStep ? window.google.maps.Animation.BOUNCE : null
  ), [isLoaded, currentStep]);

  const getPersonIcon = useCallback(() => ({
    url: '/person-icon.png', // Make sure to add this icon to your public folder
    scaledSize: isLoaded ? new window.google.maps.Size(30, 30) : null
  }), [isLoaded]);

  useEffect(() => {
    if (isLoaded && currentStep > 0) {
      const start = locations[currentStep - 1];
      const end = locations[currentStep];
      const numSteps = 100; // Number of steps for animation

      let step = 0;
      const interval = setInterval(() => {
        const nextLat = start.lat + (end.lat - start.lat) * (step / numSteps);
        const nextLng = start.lng + (end.lng - start.lng) * (step / numSteps);
        
        setAnimatedPositions(prev => [...prev, { lat: nextLat, lng: nextLng }]);

        step++;
        if (step > numSteps) {
          clearInterval(interval);
        }
      }, 50); // Adjust this value to change animation speed

      return () => clearInterval(interval);
    }
  }, [currentStep, locations, isLoaded]);

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
        options={{ strokeColor: "#0000FF", strokeWeight: 4 }}
      />

      {animatedPositions.map((position, index) => (
        <Marker
          key={`person-${index}`}
          position={position}
          icon={getPersonIcon()}
          zIndex={1000} // Ensure the animated icons appear above the route
        />
      ))}
    </GoogleMap>
  );
};

export default BirthdayMap;