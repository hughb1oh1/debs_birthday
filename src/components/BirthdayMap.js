import React, { useCallback, useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: -33.8568, lng: 151.2153 }; // Sydney's coordinates

const guests = [
  { name: "Guest 1", icon: "👩" },
  { name: "Guest 2", icon: "👨" },
  { name: "Guest 3", icon: "👩‍🦰" },
  { name: "Guest 4", icon: "👨‍🦳" },
  { name: "Guest 5", icon: "👩‍🦱" },
  { name: "Guest 6", icon: "👨‍🦰" },
  { name: "Guest 7", icon: "👵" },
  { name: "Guest 8", icon: "👴" }
];

const BirthdayMap = ({ locations, currentStep, onMapLoad }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [guestMarkers, setGuestMarkers] = useState([]);
  const [routePolylines, setRoutePolylines] = useState([]);
  const animationRef = useRef(null);

  const mapLoad = useCallback((map) => {
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
      const offset = getRandomOffset();
      return new window.google.maps.Marker({
        position: { 
          lat: locations[0].lat + offset.lat, 
          lng: locations[0].lng + offset.lng 
        },
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

    // Create polylines for all route segments
    createAllRoutePolylines(map);

    if (onMapLoad) onMapLoad(map);
  }, [locations, onMapLoad]);

  const createAllRoutePolylines = async (map) => {
    const newPolylines = [];
    for (let i = 0; i < locations.length - 1; i++) {
      const origin = locations[i];
      const destination = locations[i + 1];
      const result = await getDirections(origin, destination);
      if (result) {
        const polyline = new window.google.maps.Polyline({
          path: result.routes[0].overview_path,
          geodesic: true,
          strokeColor: '#0000FF',
          strokeOpacity: 0.5,
          strokeWeight: 4,
          map: map,
        });
        newPolylines.push(polyline);
      }
    }
    setRoutePolylines(newPolylines);
  };

  const getDirections = (origin, destination) => {
    return new Promise((resolve, reject) => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            console.error('Directions request failed:', status);
            reject(null);
          }
        }
      );
    });
  };

  const getRandomOffset = () => {
    return {
      lat: (Math.random() - 0.5) * 0.0002,
      lng: (Math.random() - 0.5) * 0.0002
    };
  };

  const animateRoute = useCallback((path, duration) => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      guestMarkers.forEach((marker, index) => {
        const pathIndex = Math.floor(progress * (path.length - 1));
        const nextIndex = Math.min(pathIndex + 1, path.length - 1);
        const segmentProgress = progress * (path.length - 1) - pathIndex;
        
        const currentPoint = path[pathIndex];
        const nextPoint = path[nextIndex];
        
        const lat = currentPoint.lat() + (nextPoint.lat() - currentPoint.lat()) * segmentProgress;
        const lng = currentPoint.lng() + (nextPoint.lng() - currentPoint.lng()) * segmentProgress;
        
        // Add a random offset to each guest to simulate shuffling
        const offset = getRandomOffset();
        
        marker.setPosition({ lat: lat + offset.lat, lng: lng + offset.lng });
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [guestMarkers]);

  useEffect(() => {
    if (map && locations && locations.length > 1 && currentStep < locations.length - 1) {
      const origin = locations[currentStep];
      const destination = locations[currentStep + 1];

      getDirections(origin, destination).then((result) => {
        if (result) {
          animateRoute(result.routes[0].overview_path, 5000);
          
          // Highlight current route segment
          routePolylines.forEach((polyline, index) => {
            polyline.setOptions({ strokeOpacity: index === currentStep ? 1.0 : 0.5 });
          });
        }
      });
    }
  }, [map, locations, currentStep, routePolylines, animateRoute]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      onLoad={mapLoad}
    />
  );
};

export default BirthdayMap;