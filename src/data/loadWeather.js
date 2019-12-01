const addWeatherToDOM = require('../view/addWeatherToDOM')
const { WEATHER_ENDPOINT, FALLBACK_WEATHER, getWeatherUrl } = require('./weatherAPIs')
const fetchJsonResource = require('./fetchJsonResource')
const getCustomParams = require('./getCustomParams')
const logError = require('./utils/logError')

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
    if (window.custom_location) {
        logError('Unrecognized zip code (or zip + country combination). Falling back to default weather params.')

        window.custom_location = false
        window.isMetric = false

        return fetchJsonResource(WEATHER_ENDPOINT, addWeatherToDOM, useFallbackWeather, isSuccessfulReponseBody)
    }

    logError(
        'Failed to retrieve default weather location data. Using fallback weather blob which does not reflect current weather conditions.'
    )
    return addWeatherToDOM(FALLBACK_WEATHER)
}

module.exports = loadWeather
