const addMoonToDOM = require('../view/addMoonToDOM'); 
const logError = require('../logError');
const { subscribe } = require('../view/DOMutils');
const { MOON_ENDPOINT, FALLBACK_MOON } = require('./weatherAPIs');

function loadMoon(unixTimestamp) {
    fetch(MOON_ENDPOINT + unixTimestamp)
        .then(handleMoonResponse)
        .then(updateMoonOnGoodResponse)
        .catch(logError);
}

function handleMoonResponse(apiResponse) {
    if (!apiResponse.ok) return useFallbackMoon();
    
    return apiResponse.json();
}

function useFallbackMoon() {
    return FALLBACK_MOON;
}

function updateMoonOnGoodResponse(jsonBlob) {
    let fallbackBlob;

    if (jsonBlob[0] && jsonBlob[0].ErrorMsg != 'success') fallbackBlob = FALLBACK_MOON;

    
    if (document.readyState != 'loading') {
        return addMoonToDOM(fallbackBlob || jsonBlob);
    }

    subscribe(
        'DOMContentLoaded',
        () => { addMoonToDOM(fallbackBlob || jsonBlob, 'DOMContentLoaded', 'weatherEventListener') },
        'weatherEventListener');
}

module.exports = loadMoon;