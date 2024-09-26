import React, { useState, useCallback, useRef, useEffect } from 'react';
import BirthdayMap from './components/BirthdayMap';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import './App.css';
import config from './config.json';

const locations = [
  { name: "Wynyard Station", lat: -33.8665, lng: 151.2074 },
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [venueSummary, setVenueSummary] = useState(null);
  const mapRef = useRef(null);

  const handlePlay = useCallback(() => {
    if (!isAnimating && currentStep < locations.length - 1) {
      setIsAnimating(true);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, isAnimating]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsAnimating(false);
    setVenueSummary(null);
    if (mapRef.current) {
      mapRef.current.resetMap();
    }
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    fetchVenueSummary(locations[currentStep].name);
  }, [currentStep]);

  const fetchVenueSummary = async (venueName) => {
    try {
      const response = await fetch(`/menus/${venueName.toLowerCase().replace(/\s+/g, '-')}.json`);
      const data = await response.json();
      setVenueSummary(data.summary);
    } catch (error) {
      console.error('Error fetching venue summary:', error);
      setVenueSummary('Venue summary not available');
    }
  };

  useEffect(() => {
    if (venueSummary) {
      setTimeout(() => {
        setVenueSummary(null);
        if (currentStep < locations.length - 1) {
          setIsAnimating(true);
          setCurrentStep(prev => prev + 1);
        }
      }, config.pauseDuration);
    }
  }, [venueSummary, currentStep]);

  return (
    <div className="App">
      <div className="map-container">
        <BirthdayMap 
          ref={mapRef}
          locations={locations} 
          currentStep={currentStep}
          onMapLoad={onMapLoad}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
      <div className="controls-overlay">
        <button onClick={handlePlay} disabled={isAnimating || currentStep === locations.length - 1}>
          <PlayIcon className="h-8 w-8" />
        </button>
        <button onClick={handleReset}>
          <ArrowPathIcon className="h-8 w-8" />
        </button>
      </div>
      {venueSummary && (
        <div className="modal">
          <div className="modal-content">
            <h2>{locations[currentStep].name}</h2>
            <p>{venueSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;