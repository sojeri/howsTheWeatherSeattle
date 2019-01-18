const addMoonToDOM = require('../view/addMoonToDOM');
const { MOON_ENDPOINT, FALLBACK_MOON } = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function loadMoon(unixTimestamp) {
    fetchJsonResource(
        MOON_ENDPOINT + unixTimestamp,
        addMoonToDOM,
        useFallbackMoon,
        isSuccessfulReponseBody);
}

function isSuccessfulReponseBody(blob) {
    return blob[0] && blob[0].ErrorMsg == 'success';
}

function useFallbackMoon() {
    return addMoonToDOM(FALLBACK_MOON);
}

module.exports = loadMoon;