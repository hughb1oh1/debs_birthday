import React, { useState, useCallback, useRef } from 'react';
import BirthdayMap from './components/BirthdayMap';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import './App.css';

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
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueDetails, setVenueDetails] = useState(null);
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
    if (mapRef.current) {
      mapRef.current.resetMap();
    }
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const handleMarkerClick = useCallback((location) => {
    setSelectedVenue(location);
    setTimeout(() => {
      setVenueDetails({
        name: location.name,
        description: `This is a mock description for ${location.name}.`,
        address: "123 Mock Street, Sydney NSW 2000",
        rating: 4.5,
      });
    }, 300);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return (
    <div className="App">
      <div className="map-container">
        <BirthdayMap 
          ref={mapRef}
          locations={locations} 
          currentStep={currentStep}
          onMapLoad={onMapLoad}
          onMarkerClick={handleMarkerClick}
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
      {selectedVenue && venueDetails && (
        <div className="modal">
          <div className="modal-content">
            <h2>{venueDetails.name}</h2>
            <p>{venueDetails.description}</p>
            <p>Address: {venueDetails.address}</p>
            <p>Rating: {venueDetails.rating}/5</p>
            <button onClick={() => setSelectedVenue(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;