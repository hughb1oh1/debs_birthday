import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests, currentStep, onVenueClick, zoomToGuest, setZoomToGuest }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef();
  const [map, setMap] = useState(null);

  const getMarkerIcon = useCallback((name) => ({
    url: `/venue-icons/${name.toLowerCase().replace(' ', '-')}.png`,
    scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null
  }), [isLoaded]);

  const getMarkerAnimation = useCallback((index) => (
    isLoaded && index === currentStep ? window.google.maps.Animation.BOUNCE : null
  ), [isLoaded, currentStep]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  useEffect(() => {
    if (mapRef.current && zoomToGuest) {
      const guestIndex = guests.findIndex(g => g.name === zoomToGuest.name);
      if (guestIndex !== -1) {
        const position = locations[guestIndex % locations.length];
        mapRef.current.panTo({ lat: position.lat, lng: position.lng });
        mapRef.current.setZoom(18);
        setZoomToGuest(null);
      }
    }
  }, [zoomToGuest, guests, locations, setZoomToGuest]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      onLoad={onMapLoad}
    >
      {map && locations.map((location, index) => (
        <Marker
          key={`venue-${index}`}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => onVenueClick(location)}
          icon={getMarkerIcon(location.name)}
          animation={getMarkerAnimation(index)}
        />
      ))}
      
      {map && guests.map((guest, index) => (
        <Marker
          key={`guest-${index}`}
          position={locations[index % locations.length]}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
          label={{
            text: guest.icon,
            fontSize: "16px",
            fontWeight: "bold",
          }}
        />
      ))}
      
      {map && (
        <Polyline
          path={locations.slice(0, currentStep + 1).map(loc => ({ lat: loc.lat, lng: loc.lng }))}
          options={{ strokeColor: "#0000FF", strokeWeight: 4 }}
        />
      )}
    </GoogleMap>
  );
};

export default BirthdayMap;