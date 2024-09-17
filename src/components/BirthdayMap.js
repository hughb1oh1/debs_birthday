import React, { useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import config from '../config.json';

const mapContainerStyle = { width: '100%', height: '100%' };

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

const BirthdayMap = forwardRef(({ locations, currentStep, onMapLoad, onMarkerClick, isAnimating, onAnimationComplete }, ref) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const guestMarkersRef = useRef([]);
  const routePolylinesRef = useRef([]);
  const animationRef = useRef(null);
  const lastAnimatedStepRef = useRef(-1);

  useImperativeHandle(ref, () => ({
    resetMap: () => {
      if (mapRef.current) {
        mapRef.current.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
        mapRef.current.setZoom(15);
        guestMarkersRef.current.forEach(marker => {
          const offset = getRandomOffset();
          marker.setPosition({ 
            lat: locations[0].lat + offset.lat, 
            lng: locations[0].lng + offset.lng 
          });
        });
        routePolylinesRef.current.forEach((polyline) => {
          polyline.setOptions({ strokeOpacity: 0.5 });
        });
        lastAnimatedStepRef.current = -1;
      }
    }
  }));

  const mapLoad = useCallback((map) => {
    mapRef.current = map;
    
    map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
    map.setZoom(15);
    
    locations.forEach((location, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        label: {
          text: location.name,
          color: 'black',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });

      marker.addListener('click', () => {
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        onMarkerClick(location);
        map.setCenter(currentCenter);
        map.setZoom(currentZoom);
      });
    });

    createAllRoutePolylines(map);
    initializeGuestMarkers(map);

    if (onMapLoad) onMapLoad({ resetMap: ref.current.resetMap });
  }, [locations, onMapLoad, onMarkerClick, ref]);

  const initializeGuestMarkers = useCallback((map) => {
    guestMarkersRef.current = guests.map((guest) => {
      const offset = getRandomOffset();
      return new window.google.maps.Marker({
        position: { 
          lat: locations[0].lat + offset.lat, 
          lng: locations[0].lng + offset.lng 
        },
        map: map,
        title: guest.name,
        draggable: true,
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
  }, [locations]);

  const createAllRoutePolylines = useCallback(async (map) => {
    try {
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
      routePolylinesRef.current = newPolylines;
    } catch (error) {
      console.error("Error creating route polylines:", error);
    }
  }, [locations]);

  const getDirections = useCallback((origin, destination) => {
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
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }, []);

  const getRandomOffset = useCallback(() => {
    return {
      lat: (Math.random() - 0.5) * 0.0002,
      lng: (Math.random() - 0.5) * 0.0002
    };
  }, []);

  const animateRoute = useCallback((path, duration) => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      guestMarkersRef.current.forEach((marker) => {
        const pathIndex = Math.floor(progress * (path.length - 1));
        const nextIndex = Math.min(pathIndex + 1, path.length - 1);
        const segmentProgress = progress * (path.length - 1) - pathIndex;
        
        const currentPoint = path[pathIndex];
        const nextPoint = path[nextIndex];
        
        const lat = currentPoint.lat() + (nextPoint.lat() - currentPoint.lat()) * segmentProgress;
        const lng = currentPoint.lng() + (nextPoint.lng() - currentPoint.lng()) * segmentProgress;
        
        const offset = getRandomOffset();
        
        marker.setPosition({ lat: lat + offset.lat, lng: lng + offset.lng });
      });

      if (mapRef.current && progress > 0 && progress < 1) {
        const midIndex = Math.floor(path.length / 2);
        mapRef.current.panTo(path[midIndex]);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        lastAnimatedStepRef.current = currentStep;
        onAnimationComplete();
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [currentStep, onAnimationComplete, getRandomOffset]);

  useEffect(() => {
    const handleAnimation = async () => {
      if (mapRef.current && locations && locations.length > 1 && currentStep < locations.length - 1 && isAnimating) {
        try {
          const origin = locations[currentStep];
          const destination = locations[currentStep + 1];
          const result = await getDirections(origin, destination);
          
          routePolylinesRef.current.forEach((polyline, index) => {
            polyline.setOptions({ strokeOpacity: index === currentStep ? 1.0 : 0.5 });
          });
          
          const currentZoom = mapRef.current.getZoom();

          if (lastAnimatedStepRef.current !== currentStep) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].overview_path.forEach((point) => bounds.extend(point));
            mapRef.current.fitBounds(bounds);
            mapRef.current.setZoom(currentZoom);
          }

          animateRoute(result.routes[0].overview_path, 5000);
        } catch (error) {
          console.error("Error during animation:", error);
        }
      }
    };

    handleAnimation();
  }, [currentStep, isAnimating, locations, getDirections, animateRoute]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={{ lat: locations[0].lat, lng: locations[0].lng }}
      zoom={15}
      onLoad={mapLoad}
    />
  );
});

export default BirthdayMap;