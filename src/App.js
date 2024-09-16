import React, { useState, useEffect } from 'react';
import BirthdayMap from './components/BirthdayMap';
import PlayControls from './components/PlayControls';
import GuestList from './components/GuestList';
import VenueDetails from './components/VenueDetails';
import { Dialog } from '@headlessui/react';
import './App.css';

const locations = [
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

function App() {
  const [playState, setPlayState] = useState('paused');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    let timer;
    if (playState === 'playing') {
      timer = setInterval(() => {
        setCurrentStep(step => {
          const nextStep = step + 1;
          if (nextStep >= locations.length) {
            setPlayState('paused');
            return step;
          }
          return nextStep;
        });
      }, 5000); // Move to next location every 5 seconds
    }
    return () => clearInterval(timer);
  }, [playState]);
  
  const handlePlayPause = () => {
    setPlayState(state => state === 'playing' ? 'paused' : 'playing');
  };

  const handleReset = () => {
    setCurrentStep(0);
    setPlayState('paused');
  };

  return (
    <div className="App">
      <div className="left-panel">
        <h1>Deb's 60th Birthday Celebration</h1>
        <PlayControls 
          playState={playState} 
          onPlayPause={handlePlayPause}
          onReset={handleReset}
        />
        <GuestList onGuestClick={setSelectedGuest} />
      </div>
      <div className="map-container">
        <BirthdayMap 
          locations={locations}
          currentStep={currentStep} 
          onVenueClick={setSelectedVenue}
        />
      </div>
      
      <Dialog open={!!selectedGuest} onClose={() => setSelectedGuest(null)}>
        <Dialog.Panel>
          <Dialog.Title>{selectedGuest?.name}</Dialog.Title>
          <p>{selectedGuest?.icon}</p>
          <p>{selectedGuest?.details}</p>
        </Dialog.Panel>
      </Dialog>
      
      <Dialog open={!!selectedVenue} onClose={() => setSelectedVenue(null)}>
        <Dialog.Panel>
          <Dialog.Title>{selectedVenue?.name}</Dialog.Title>
          <VenueDetails venue={selectedVenue} />
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}

export default App;