import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -33.8568, // Sydney's latitude
  lng: 151.2153  // Sydney's longitude
};

const locations = [
  { name: "The Glenmore Hotel", lat: -33.8599, lng: 151.2090 },
  { name: "Maybe Sammy", lat: -33.8614, lng: 151.2082 },
  { name: "Tayim", lat: -33.8608, lng: 151.2082 },
  { name: "La Renaissance Patisserie", lat: -33.8593, lng: 151.2080 }
];

const BirthdayMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <LoadScript googleMapsApiKey="AIzaSyBMRljFnpbjoFMJDzO1NzDpJrq6Wm_F0jk">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
          />
        ))}
        
        <Polyline
          path={locations.map(loc => ({ lat: loc.lat, lng: loc.lng }))}
          options={{ strokeColor: "#FF0000" }}
        />

        {selectedLocation && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            backgroundColor: 'white', 
            padding: '10px',
            borderRadius: '5px'
          }}>
            <h3>{selectedLocation.name}</h3>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default BirthdayMap;