const addWeatherToDOM = require('../view/addWeatherToDOM')
const { WEATHER_ENDPOINT, FALLBACK_WEATHER, getWeatherUrl } = require('./weatherAPIs')
const fetchJsonResource = require('./fetchJsonResource')
const getCustomParams = require('./getCustomParams')

let weatherURI = WEATHER_ENDPOINT

function handleUrlOverrides() {
    const customParams = getCustomParams()

    if (customParams) {
        weatherURI = getWeatherUrl(customParams.zip, customParams.units, customParams.country)
        window.custom_location = true
        window.is_metric = customParams.units == 'metric'
    }
}

function loadWeather() {
    handleUrlOverrides()

    fetchJsonResource(weatherURI, addWeatherToDOM, useFallbackWeather, isSuccessfulReponseBody)
}

function isSuccessfulReponseBody(blob) {
    return blob.cod && blob.cod == 200
}

function useFallbackWeather() {
    return addWeatherToDOM(FALLBACK_WEATHER)
}

module.exports = loadWeather
