import React from 'react';

const PlayControls = ({ playState, onPlayPause, onReset }) => (
  <div className="play-controls">
    <button onClick={onPlayPause}>
      {playState === 'playing' ? 'Pause' : 'Play'}
    </button>
    <button onClick={onReset}>Reset</button>
  </div>
);

export default PlayControls;