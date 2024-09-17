import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests, currentStep, focusedGuest }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);
  const [guestPositions, setGuestPositions] = useState([]);
  const animationRef = useRef(null);
  const polylineRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapInstance(map);
  }, []);

  const generateRandomOffset = () => {
    return (Math.random() - 0.5) * 0.0002;
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

      moveGuests(start, end, progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  }, [moveGuests]);

  useEffect(() => {
    if (mapInstance && locations) {
      // Draw polyline
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      polylineRef.current = new window.google.maps.Polyline({
        path: locations,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      polylineRef.current.setMap(mapInstance);

      // Clear existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Initialize guest positions at the first location or animate to next location
      if (currentStep === 0) {
        const initialPositions = guests.map(() => ({
          lat: locations[0].lat + generateRandomOffset(),
          lng: locations[0].lng + generateRandomOffset()
        }));
        setGuestPositions(initialPositions);
      } else {
        const start = locations[currentStep - 1];
        const end = locations[currentStep];
        animateRoute(start, end, 5000); // 5 seconds duration
      }
    }
  }, [mapInstance, locations, guests, currentStep, animateRoute]);

  useEffect(() => {
    if (mapInstance && focusedGuest !== null && guestPositions[focusedGuest]) {
      mapInstance.panTo(guestPositions[focusedGuest]);
      mapInstance.setZoom(18);
    }
  }, [mapInstance, focusedGuest, guestPositions]);

  const handleDragEnd = (index, event) => {
    const newPositions = [...guestPositions];
    newPositions[index] = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setGuestPositions(newPositions);
  };

  if (loadError) return <div>Error loading maps</div>;
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
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: "#FF4136",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          }}
          label={{
            text: "🏢",
            fontSize: "24px",
            fontWeight: "bold",
          }}
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
    </GoogleMap>
  );
};

export default BirthdayMap;