import React, { useCallback, useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const BirthdayMap = ({ locations, guests, currentStep, focusedGuest }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [guestMarkers, setGuestMarkers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);
  const animationRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    setMap(map);

    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach((location) => {
      bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
    });
    map.fitBounds(bounds);

    // Add location markers
    locations.forEach((location, index) => {
      new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
    });

    // Initialize guest markers
    const initialGuestMarkers = guests.map((guest, index) => {
      return new window.google.maps.Marker({
        position: { lat: locations[0].lat, lng: locations[0].lng },
        map: map,
        title: guest.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 15,
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
      });
    });
    setGuestMarkers(initialGuestMarkers);
  }, [locations, guests]);

  useEffect(() => {
    if (map && locations && locations.length > 1) {
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
              setDirections(result);
              
              // Create and set the route polyline
              if (routePolyline) {
                routePolyline.setMap(null);
              }
              const newPolyline = new window.google.maps.Polyline({
                path: result.routes[0].overview_path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map,
              });
              setRoutePolyline(newPolyline);

              animateRoute(result.routes[0].overview_path, 5000);
            } else {
              console.error('Directions request failed:', status);
            }
          }
        );
      }
    }
  }, [map, locations, currentStep]);

  const animateRoute = (path, duration) => {
    const startTime = new Date().getTime();
    const animate = () => {
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      guestMarkers.forEach((marker, index) => {
        const position = path[Math.floor(progress * (path.length - 1))];
        marker.setPosition(position);
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  useEffect(() => {
    if (map && focusedGuest !== null && guestMarkers[focusedGuest]) {
      map.panTo(guestMarkers[focusedGuest].getPosition());
      map.setZoom(18);
    }
  }, [map, focusedGuest, guestMarkers]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      onLoad={onMapLoad}
    />
  );
};

export default BirthdayMap;