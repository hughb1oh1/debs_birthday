import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '400px' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations }) => {
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
      console.log('Attempting to add markers manually');
      locations.forEach((location, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          title: location.name,
          label: (index + 1).toString()
        });
        marker.addListener('click', () => {
          console.log(`Venue clicked: ${location.name}`);
        });
      });
    }
  }, [mapInstance, locations]);

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