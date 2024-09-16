import React from 'react';

const guests = [
  { name: "Guest 1", icon: "👩", details: "Details about Guest 1" },
  { name: "Guest 2", icon: "👨", details: "Details about Guest 2" },
  // Add more guests as needed
];

const GuestList = ({ onGuestClick }) => (
  <div className="guest-list">
    {guests.map((guest, index) => (
      <button key={index} onClick={() => onGuestClick(guest)}>
        {guest.icon} {guest.name}
      </button>
    ))}
  </div>
);

export default GuestList;