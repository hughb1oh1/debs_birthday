import configJson from './config.json';

const config = {
  PUBLIC_URL: process.env.PUBLIC_URL || configJson.PUBLIC_URL,
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || configJson.GOOGLE_MAPS_API_KEY,
  zoomLevels: configJson.zoomLevels,
  animationSpeed: configJson.animationSpeed,
  pauseDuration: configJson.pauseDuration,
  startDialog: configJson.startDialog,
  endDialog: configJson.endDialog
};

export default config;