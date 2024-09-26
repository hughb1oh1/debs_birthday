import React, { useCallback, useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api';
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

const BirthdayMap = forwardRef(({ locations, currentStep, onMapLoad, isAnimating, onAnimationComplete, mapCenter }, ref) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const guestMarkersRef = useRef([]);
  const routePolylinesRef = useRef([]);
  const animationRef = useRef(null);
  const currentPathRef = useRef(null);
  const currentProgressRef = useRef(0);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(mapCenter);

  const getRandomOffset = useCallback(() => {
    return {
      lat: (Math.random() - 0.5) * 0.0002,
      lng: (Math.random() - 0.5) * 0.0002
    };
  }, []);

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
  }, [locations, getDirections]);

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
  }, [locations, getRandomOffset]);

  useImperativeHandle(ref, () => ({
    resetMap: () => {
      if (mapRef.current) {
        const initialCenter = { lat: locations[0].lat, lng: locations[0].lng };
        mapRef.current.panTo(initialCenter);
        mapRef.current.setZoom(config.zoomLevels.initial);
        setCurrentMapCenter(initialCenter);
        guestMarkersRef.current.forEach(marker => {
          const offset = getRandomOffset();
          marker.setPosition({ 
            lat: locations[0].lat + offset.lat, 
            lng: locations[0].lng + offset.lng 
          });
        });
        currentPathRef.current = null;
        currentProgressRef.current = 0;
      }
    }
  }), [locations, getRandomOffset]);

  const fetchVenueDetails = useCallback(async (location) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/venue-menus/${location.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.details) {
        throw new Error("Details property not found in JSON");
      }
      setSelectedVenue(data.details);
    } catch (error) {
      console.error('Error fetching venue details:', error);
      setSelectedVenue({ heading: "Error", content: "Venue details not available" });
    }
  }, []);

  const mapLoad = useCallback((map) => {
    mapRef.current = map;
    
    map.setCenter(currentMapCenter);
    map.setZoom(config.zoomLevels.initial);
    
    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
      });

      marker.addListener('click', () => {
        setCurrentMapCenter({ lat: location.lat, lng: location.lng });
        fetchVenueDetails(location);
      });

      const labelContent = document.createElement('div');
      labelContent.innerHTML = location.marker_label || location.name;
      labelContent.style.color = 'black';
      labelContent.style.fontSize = '14px';
      labelContent.style.fontWeight = 'bold';
      labelContent.style.backgroundColor = 'white';
      labelContent.style.padding = '5px';
      labelContent.style.borderRadius = '3px';
      labelContent.style.boxShadow = '1px 1px 3px rgba(0,0,0,0.3)';

      const label = new window.google.maps.OverlayView();
      label.onAdd = function() {
        this.getPanes().overlayMouseTarget.appendChild(labelContent);
      }
      label.draw = function() {
        const projection = this.getProjection();
        const position = projection.fromLatLngToDivPixel(marker.getPosition());
        labelContent.style.position = 'absolute';
        labelContent.style.left = (position.x + 10) + 'px';
        labelContent.style.top = (position.y - 40) + 'px';
      }
      label.setMap(map);
    });

    createAllRoutePolylines(map);
    initializeGuestMarkers(map);

    if (onMapLoad) onMapLoad(ref.current);
  }, [locations, onMapLoad, ref, createAllRoutePolylines, initializeGuestMarkers, fetchVenueDetails, currentMapCenter]);

  const animateRoute = useCallback((path, duration) => {
    let startTime;
    currentPathRef.current = path;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      currentProgressRef.current = progress;

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

      if (mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        guestMarkersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
        mapRef.current.fitBounds(bounds);
        mapRef.current.setZoom(Math.min(mapRef.current.getZoom(), config.zoomLevels.following));
      }

      if (progress < 1 && isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (progress >= 1) {
        onAnimationComplete();
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, onAnimationComplete, getRandomOffset]);

  useEffect(() => {
    const handleAnimation = async () => {
      if (mapRef.current && locations && currentStep >= 0 && currentStep < locations.length - 1 && isAnimating) {
        const currentLocation = locations[currentStep];
        const nextLocation = locations[currentStep + 1];
        try {
          const result = await getDirections(currentLocation, nextLocation);
          animateRoute(result.routes[0].overview_path, config.animationSpeed);
        } catch (error) {
          console.error("Error during animation:", error);
        }
      }
    };

    handleAnimation();
  }, [currentStep, isAnimating, locations, getDirections, animateRoute]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(currentMapCenter);
    }
  }, [currentMapCenter]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentMapCenter}
        zoom={config.zoomLevels.initial}
        onLoad={mapLoad}
      />
      {selectedVenue && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedVenue.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: selectedVenue.content }} />
            <button onClick={() => setSelectedVenue(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
});

export default BirthdayMap;