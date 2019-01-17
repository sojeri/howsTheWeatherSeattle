const addWeatherToDOM = require('../view/addWeatherToDOM'); 
const logError = require('../logError');
const { subscribe } = require('../view/DOMutils');
const { WEATHER_ENDPOINT, FALLBACK_WEATHER } = require('./weatherAPIs');

function loadWeather() {
    fetch(WEATHER_ENDPOINT)
        .then(handleWeatherResponse)
        .then(updateWeatherOnGoodResponse)
        .catch(logError);
}

function handleWeatherResponse(apiResponse) {
    if (!apiResponse.ok) return useFallbackWeather();
    
    return apiResponse.json();
}

function useFallbackWeather() {
    return FALLBACK_WEATHER;
}

function updateWeatherOnGoodResponse(jsonBlob) {
    let fallbackBlob;

    if (jsonBlob.cod != 200) fallbackBlob = FALLBACK_WEATHER;

    if (document.readyState != 'loading') {
        addWeatherToDOM(fallbackBlob || jsonBlob)
    }

    subscribe(
        'DOMContentLoaded',
        () => { addWeatherToDOM(fallbackBlob || jsonBlob, 'DOMContentLoaded', 'weatherEventListener') },
        'weatherEventListener');
}

module.exports = loadWeather;