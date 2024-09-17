import React, { useState, useCallback } from 'react';
import BirthdayMap from './components/BirthdayMap';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import './App.css';

const locations = [
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [map, setMap] = useState(null);

  const handlePlay = useCallback(() => {
    if (!isAnimating && currentStep < locations.length - 1) {
      setIsAnimating(true);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 5000); // Match this with the animation duration in BirthdayMap
    }
  }, [currentStep, isAnimating]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsAnimating(false);
    if (map) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
      });
      map.fitBounds(bounds);
    }
  }, [map]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  return (
    <div className="App">
      <div className="map-container">
        <BirthdayMap 
          locations={locations} 
          currentStep={currentStep}
          onMapLoad={onMapLoad}
        />
      </div>
      <div className="controls-overlay">
        <button onClick={handlePlay} disabled={isAnimating || currentStep === locations.length - 1}>
          <PlayIcon className="h-6 w-6" />
        </button>
        <button onClick={handleReset}>
          <ArrowPathIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default App;