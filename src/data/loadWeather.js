const addWeatherToDOM = require('../view/addWeatherToDOM');
const {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    getWeatherUrl
} = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');
const getUnitsAndZipIfPresent = require('./getUnitsAndZipIfPresent');

let weatherURI = WEATHER_ENDPOINT

function handleUrlOverrides() {
    const unitsAndZip = getUnitsAndZipIfPresent()

    if (unitsAndZip) {
        weatherURI = getWeatherUrl(unitsAndZip.zip, unitsAndZip.units)
        window.custom_location = true
        window.is_metric = unitsAndZip.units == 'metric'
    }
}

function loadWeather() {
    handleUrlOverrides()

    fetchJsonResource(
        weatherURI,
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