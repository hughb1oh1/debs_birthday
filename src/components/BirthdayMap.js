import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests = [], currentStep, focusedGuest }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);
  const [guestPositions, setGuestPositions] = useState([]);
  const [polylinePath, setPolylinePath] = useState([]);
  const animationRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    console.log('Map loaded');
    mapRef.current = map;
    setMapInstance(map);
  }, []);

  const generateRandomOffset = () => {
    return (Math.random() - 0.5) * 0.0002; // Adjust this value to change the spread
  };

  const moveGuests = useCallback((from, to, progress) => {
    const newPositions = guests.map(() => {
      const lat = from.lat + (to.lat - from.lat) * progress + generateRandomOffset();
      const lng = from.lng + (to.lng - from.lng) * progress + generateRandomOffset();
      return { lat, lng };
    });
    setGuestPositions(newPositions);
  }, [guests]);

  const animateRoute = useCallback((start, end, duration) => {
    const startTime = new Date().getTime();
    const animate = () => {
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Animate polyline
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;
      setPolylinePath(prev => [...prev, { lat, lng }]);

      // Move guests
      moveGuests(start, end, progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  }, [moveGuests]);

  const startNextStep = useCallback(() => {
    if (currentStep < locations.length - 1) {
      const start = locations[currentStep];
      const end = locations[currentStep + 1];
      animateRoute(start, end, 5000); // 5 seconds duration
    }
  }, [currentStep, locations, animateRoute]);

  useEffect(() => {
    if (mapInstance && locations) {
      // Clear existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Reset polyline and guest positions
      setPolylinePath([locations[0]]);
      setGuestPositions(guests.map(() => ({
        lat: locations[0].lat + generateRandomOffset(),
        lng: locations[0].lng + generateRandomOffset()
      })));

      // Start animation for the current step
      startNextStep();
    }
  }, [mapInstance, locations, guests, currentStep, startNextStep]);

  useEffect(() => {
    if (mapInstance && focusedGuest !== null) {
      const guestPosition = guestPositions[focusedGuest];
      if (guestPosition) {
        mapInstance.panTo(guestPosition);
        mapInstance.setZoom(18);
      }
    }
  }, [mapInstance, focusedGuest, guestPositions]);

  const handleDragEnd = (index, event) => {
    const newPositions = [...guestPositions];
    newPositions[index] = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setGuestPositions(newPositions);
  };

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
    >
      {locations.map((location, index) => (
        <Marker
          key={`venue-${index}`}
          position={{ lat: location.lat, lng: location.lng }}
          label={(index + 1).toString()}
        />
      ))}
      
      {guestPositions.map((position, index) => (
        <Marker
          key={`guest-${index}`}
          position={position}
          draggable={true}
          onDragEnd={(e) => handleDragEnd(index, e)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
          label={{
            text: guests[index].icon,
            fontSize: "24px",
            fontWeight: "bold",
          }}
        />
      ))}

      {mapInstance && (
        <polyline
          path={polylinePath}
          options={{
            strokeColor: '#0000FF',
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default BirthdayMap;