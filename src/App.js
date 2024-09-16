import React, { useState } from 'react';
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

  const handleNextStep = () => {
    setCurrentStep(prev => (prev < locations.length - 1 ? prev + 1 : prev));
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="App">
      <h1>Deb's 60th Birthday Celebration</h1>
      <div className="map-container">
        <BirthdayMap locations={locations} guests={guests} currentStep={currentStep} />
      </div>
      <div className="controls">
        <button onClick={handleNextStep}>Next Step</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default App;