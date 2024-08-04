const addUvIndexToDOM = require('../view/addUvIndexToDOM')
const { UV_INDEX_ENDPOINT, FALLBACK_UV_INDEX, getUvIndexUrl } = require('./weatherAPIs')
const fetchJsonResource = require('./fetchJsonResource')

let uvIndexUri = UV_INDEX_ENDPOINT

function loadUvIndex() {
    if (window.custom_location) {
        if (window.location_saved) {
            uvIndexUri = getUvIndexUrl(window.latitude, window.longitude)
            actuallyLoadUvIndex()
        } else {
            setTimeout(loadUvIndex, 100)
        }
    } else {
        actuallyLoadUvIndex()
    }
}

function actuallyLoadUvIndex() {
    fetchJsonResource(uvIndexUri, addUvIndexToDOM, useFallbackAqi, isSuccessfulReponseBody, {
        'x-access-token': 'openuv-ja7rrlz51o9am-io',
        'Content-Type': 'application/json',
    })
}

function isSuccessfulReponseBody(blob) {
    return blob && blob.result?.uv
}

function useFallbackAqi() {
    return addUvIndexToDOM(FALLBACK_UV_INDEX)
}

module.exports = loadUvIndex
