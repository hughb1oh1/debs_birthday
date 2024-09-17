import React, { useState, useCallback } from 'react';
import BirthdayMap from './components/BirthdayMap';
import './App.css';

const locations = [
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

const guests = [
  { name: "Guest 1", icon: "👩" },
  { name: "Guest 2", icon: "👨" },
  { name: "Guest 3", icon: "👩‍🦰" },
  { name: "Guest 4", icon: "👨‍🦳" }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedGuest, setFocusedGuest] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNextStep = useCallback(() => {
    if (!isAnimating && currentStep < locations.length - 1) {
      setIsAnimating(true);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 5000); // Match this with the animation duration in BirthdayMap
    }
  }, [currentStep, isAnimating]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFocusedGuest(null);
    setIsAnimating(false);
  }, []);

  const handleGuestFocus = useCallback((index) => {
    setFocusedGuest(index);
  }, []);

  return (
    <div className="App">
      <div className="left-panel">
        <h1>Deb's 60th Birthday Celebration</h1>
        <div className="controls">
          <button onClick={handleNextStep} disabled={isAnimating || currentStep === locations.length - 1}>
            {isAnimating ? 'Moving...' : 'Next Step'}
          </button>
          <button onClick={handleReset}>Reset</button>
        </div>
        <div className="guest-buttons">
          <h2>Locate Guests</h2>
          {guests.map((guest, index) => (
            <button key={index} onClick={() => handleGuestFocus(index)}>
              {guest.icon} {guest.name}
            </button>
          ))}
        </div>
      </div>
      <div className="map-container">
        <BirthdayMap 
          locations={locations} 
          guests={guests} 
          currentStep={currentStep} 
          focusedGuest={focusedGuest}
        />
      </div>
    </div>
  );
}

export default App;