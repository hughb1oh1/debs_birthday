import React from 'react';

const GuestList = ({ guests, onGuestClick }) => (
  <div className="guest-list">
    {guests.map((guest, index) => (
      <button key={index} onClick={() => onGuestClick(guest)}>
        {guest.icon} {guest.name}
      </button>
    ))}
  </div>
);

export default GuestList;