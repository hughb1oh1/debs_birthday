import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '400px' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests = [], currentStep }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);

  const onMapLoad = useCallback((map) => {
    console.log('Map loaded');
    mapRef.current = map;
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (mapInstance && locations) {
      // Clear existing markers and polylines
      mapInstance.data.forEach((feature) => {
        mapInstance.data.remove(feature);
      });

      // Add venue markers
      locations.forEach((location, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          title: location.name,
          label: (index + 1).toString(),
          zIndex: 1 // Ensure venue markers are below guest markers
        });
        marker.addListener('click', () => {
          console.log(`Venue clicked: ${location.name}`);
        });
      });

      // Add guest markers
      guests.forEach((guest, index) => {
        const position = locations[index % locations.length];
        const marker = new window.google.maps.Marker({
          position: { lat: position.lat, lng: position.lng },
          map: mapInstance,
          title: guest.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
          label: {
            text: guest.icon,
            fontSize: "24px",
            fontWeight: "bold",
          },
          zIndex: 2 // Ensure guest markers are above venue markers
        });
        marker.addListener('click', () => {
          console.log(`Guest clicked: ${guest.name}`);
        });
      });

      // Add polyline
      const path = locations.slice(0, currentStep + 1).map(loc => ({ lat: loc.lat, lng: loc.lng }));
      const polyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        zIndex: 0 // Ensure polyline is below all markers
      });
      polyline.setMap(mapInstance);
    }
  }, [mapInstance, locations, guests, currentStep]);

  if (loadError) {
    console.error('Error loading maps:', loadError);
    return <div>Error loading maps</div>;
  }
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      onLoad={onMapLoad}
      onClick={() => console.log('Map clicked')}
    />
  );
};

export default BirthdayMap;