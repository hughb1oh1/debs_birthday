import React from 'react';
import BirthdayMap from './components/BirthdayMap';
import './App.css';

const locations = [
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

function App() {
  return (
    <div className="App">
      <h1>Deb's 60th Birthday Celebration</h1>
      <div className="map-container">
        <BirthdayMap locations={locations} />
      </div>
    </div>
  );
}

export default App;