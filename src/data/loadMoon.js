const addMoonToDOM = require('../view/addMoonToDOM');
const {
  MOON_ENDPOINT,
  REPLACE,
  FALLBACK_MOON,
  getMoonUrl,
} = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function getDateParam(date) {
  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString(); // js 0 index month
  const day = date.getUTCDate().toString();

  let param = year.toString();
  if (month.length < 2) param += '0';
  param += month;
  if (day.length < 2) param += '0';
  param += day;

  return param;
}

let moonURI = MOON_ENDPOINT;

function loadMoon() {
  if (window.custom_location) {
    if (window.location_saved) {
      moonURI = getMoonUrl(window.latitude, window.longitude);
      actuallyLoadMoon();
    } else {
      setTimeout(loadMoon, 100);
    }
  } else {
    actuallyLoadMoon();
  }
}

function actuallyLoadMoon() {
  const date = getDateParam(new Date(Date.now()));
  fetchJsonResource(
    moonURI.replace(REPLACE, date),
    addMoonToDOM,
    useFallbackMoon,
    isSuccessfulReponseBody
  );
}

function isSuccessfulReponseBody(blob) {
  return blob && blob.moonPhase;
}

function useFallbackMoon() {
  return addMoonToDOM(FALLBACK_MOON);
}

module.exports = loadMoon;
