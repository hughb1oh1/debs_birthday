import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests, currentStep, focusedGuest }) => {
  console.log('BirthdayMap rendered with locations:', locations);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);
  const [guestPositions, setGuestPositions] = useState([]);
  const [directions, setDirections] = useState(null);
  const animationRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    console.log('Map loaded');
    mapRef.current = map;
    setMapInstance(map);

    // Log map center and zoom level
    console.log('Map center:', map.getCenter().toJSON());
    console.log('Map zoom level:', map.getZoom());

    // Fit bounds to show all location markers
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach((location) => {
      bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
    });
    map.fitBounds(bounds);
  }, [locations]);

  const generateRandomOffset = () => {
    return (Math.random() - 0.5) * 0.0002;
  };

  const moveGuests = useCallback((path, progress) => {
    const newPositions = guests.map(() => {
      const index = Math.floor(progress * (path.length - 1));
      const nextIndex = Math.min(index + 1, path.length - 1);
      const segmentProgress = (progress * (path.length - 1)) - index;
      const lat = path[index].lat() + (path[nextIndex].lat() - path[index].lat()) * segmentProgress + generateRandomOffset();
      const lng = path[index].lng() + (path[nextIndex].lng() - path[index].lng()) * segmentProgress + generateRandomOffset();
      return { lat, lng };
    });
    setGuestPositions(newPositions);
  }, [guests]);

  const animateRoute = useCallback((path, duration) => {
    const startTime = new Date().getTime();
    const animate = () => {
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      moveGuests(path, progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  }, [moveGuests]);

  useEffect(() => {
    console.log('Map instance:', mapInstance);
    console.log('Current step:', currentStep);
    if (mapInstance && locations && locations.length > 1) {
      console.log('Calculating directions for step:', currentStep);
      const directionsService = new window.google.maps.DirectionsService();
      const origin = locations[currentStep];
      const destination = locations[currentStep + 1];

      if (destination) {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.WALKING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              console.log('Directions received:', result);
              setDirections(result);
              const path = result.routes[0].overview_path;
              animateRoute(path, 5000); // 5 seconds duration
            } else {
              console.error('Directions request failed:', status);
            }
          }
        );
      }
    }
  }, [mapInstance, locations, currentStep, animateRoute]);

  useEffect(() => {
    if (mapInstance && focusedGuest !== null && guestPositions[focusedGuest]) {
      console.log('Focusing on guest:', focusedGuest);
      mapInstance.panTo(guestPositions[focusedGuest]);
      mapInstance.setZoom(18);
    }
  }, [mapInstance, focusedGuest, guestPositions]);

  const handleDragEnd = (index, event) => {
    console.log('Guest dragged:', index);
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
      {locations.map((location, index) => {
        console.log(`Rendering location marker ${index}:`, location);
        return (
          <Marker
            key={`venue-${index}`}
            position={location}
            label={{
              text: (index + 1).toString(),
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          />
        );
      })}
      
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

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            preserveViewport: true,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default BirthdayMap;