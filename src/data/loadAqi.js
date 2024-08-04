const addAqiToDOM = require('../view/addAqiToDOM')
const { AQI_ENDPOINT, FALLBACK_AQI, getAqiUrl } = require('./weatherAPIs')
const fetchJsonResource = require('./fetchJsonResource')

let aqiURI = AQI_ENDPOINT

function loadAqi() {
    if (window.custom_location) {
        if (window.location_saved) {
            aqiURI = getAqiUrl(window.latitude, window.longitude)
            actuallyLoadAqi()
        } else {
            setTimeout(loadAqi, 100)
        }
    } else {
        actuallyLoadAqi()
    }
}

function actuallyLoadAqi() {
    fetchJsonResource(aqiURI, addAqiToDOM, useFallbackAqi, isSuccessfulReponseBody)
}

function isSuccessfulReponseBody(blob) {
    return blob && blob.list[0]?.main?.aqi
}

function useFallbackAqi() {
    return addAqiToDOM(FALLBACK_AQI)
}

module.exports = loadAqi
