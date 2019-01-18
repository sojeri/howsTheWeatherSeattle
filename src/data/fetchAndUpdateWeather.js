const addWeatherToDOM = require('../view/addWeatherToDOM');
const { WEATHER_ENDPOINT, FALLBACK_WEATHER } = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function loadWeather() {
    fetchJsonResource(
        WEATHER_ENDPOINT,
        addWeatherToDOM,
        useFallbackWeather,
        isSuccessfulReponseBody);
}

function isSuccessfulReponseBody(blob) {
    return blob.cod && blob.cod == 200;
}

function useFallbackWeather() {
    return addWeatherToDOM(FALLBACK_WEATHER);
}

module.exports = loadWeather;