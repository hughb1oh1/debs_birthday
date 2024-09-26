import React, { useState, useCallback, useRef, useEffect } from 'react';
import BirthdayMap from './components/BirthdayMap';
import { PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import './App.css';
import config from './config.json';

const locations = [
  { name: "Wynyard Station", lat: -33.8665, lng: 151.2074, marker_label: "Wynyard<br/>Station" },
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090, marker_label: "The Glenmore<br/>Hotel" },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082, marker_label: "Maybe<br/>Sammy" },
  { name: "Tayim", lat: -33.8608, lng: 151.2082, marker_label: "Tayim"},
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080, marker_label: "La Renaissance<br/>Patisserie" }
];

function App() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [venueSummary, setVenueSummary] = useState(null);
  const [mapCenter, setMapCenter] = useState(locations[0]);
  const [showStartDialog, setShowStartDialog] = useState(config.startDialog.show);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const mapRef = useRef(null);

  const handlePlay = useCallback(() => {
    if (currentStep === -1) {
      setCurrentStep(0);
      setMapCenter(locations[0]);
      fetchVenueSummary(locations[0].name);
    } else if (!isAnimating && currentStep < locations.length - 1) {
      setIsAnimating(true);
    }
  }, [currentStep, isAnimating]);

  const handleStop = useCallback(() => {
    setIsAnimating(false);
    if (mapRef.current) {
      mapRef.current.stopAnimation();
    }
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(-1);
    setIsAnimating(false);
    setVenueSummary(null);
    setMapCenter(locations[0]);
    setShowEndDialog(false);
    if (mapRef.current) {
      mapRef.current.resetMap();
    }
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    if (currentStep < locations.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMapCenter(locations[nextStep]);
      fetchVenueSummary(locations[nextStep].name);
    } else {
      setShowEndDialog(config.endDialog.show);
    }
  }, [currentStep]);

  const fetchVenueSummary = async (venueName) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/venue-menus/${venueName.toLowerCase().replace(/\s+/g, '-')}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.summary) {
        throw new Error("Summary property not found in JSON");
      }
      setVenueSummary(data.summary);
    } catch (error) {
      console.error('Error fetching venue summary:', error);
      setVenueSummary('Venue summary not available');
    }
  };

  useEffect(() => {
    let timer;
    if (venueSummary) {
      timer = setTimeout(() => {
        setVenueSummary(null);
        if (currentStep < locations.length - 1) {
          setIsAnimating(true);
        } else {
          setShowEndDialog(config.endDialog.show);
        }
      }, config.pauseDuration);
    }
    return () => clearTimeout(timer);
  }, [venueSummary, currentStep]);

  const renderDialog = (dialog, onClose) => (
    <div className="modal">
      <div className="modal-content">
        <h2>{dialog.heading}</h2>
        <div dangerouslySetInnerHTML={{ __html: dialog.content }} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

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
          mapCenter={mapCenter}
        />
      </div>
      <div className="controls-overlay">
        <button onClick={handlePlay} disabled={isAnimating || currentStep === locations.length - 1}>
          <PlayIcon className="h-8 w-8" />
        </button>
        <button onClick={handleStop} disabled={!isAnimating}>
          <StopIcon className="h-8 w-8" />
        </button>
        <button onClick={handleReset}>
          <ArrowPathIcon className="h-8 w-8" />
        </button>
      </div>
      {showStartDialog && renderDialog(config.startDialog, () => setShowStartDialog(false))}
      {showEndDialog && renderDialog(config.endDialog, () => setShowEndDialog(false))}
      {venueSummary && (
        <div className="modal">
          <div className="modal-content">
            <h2>{locations[currentStep].name}</h2>
            <div dangerouslySetInnerHTML={{ __html: venueSummary }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;