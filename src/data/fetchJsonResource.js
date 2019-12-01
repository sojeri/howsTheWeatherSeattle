const logError = require('./utils/logError')
const { subscribe, unsubscribe } = require('./DOMutils')

function fetchJsonResource(URI, successCallback, failureCallback, isHealthyResponseCallback) {
    let startTime = Date.now()
    fetch(URI)
        .then(res => handleResponse(res))
        .then(blob => checkResponseBody(blob, isHealthyResponseCallback, successCallback, failureCallback, startTime))
        .catch(err => handleFailure(err, failureCallback))
}

function handleResponse(apiResponse) {
    if (!apiResponse.ok) throw new Error(`Unhealthy response returned by API. Response code: ${apiResponse.status}.`)
    return apiResponse.json()
}

function checkResponseBody(apiResponseBlob, isHealthyApiResponseCallback, successCallback, failureCallback, startTime) {
    const next = () => {
        return isHealthyApiResponseCallback(apiResponseBlob)
            ? successCallback(apiResponseBlob, startTime)
            : failureCallback()
    }

    if (document.readyState != 'loading') {
        return next()
    }

    const subscribeId = getRandomIdentifier()
    subscribe(
        'DOMContentLoaded',
        () => {
            unsubscribeHandler(next, 'DOMContentLoaded', subscribeId)
        },
        subscribeId
    )
}

function unsubscribeHandler(nextCallback, eventName, eventHandlerLookup) {
    unsubscribe(eventName, eventHandlerLookup)
    nextCallback()
}

function handleFailure(error, failureCallback) {
    if (error) logError(error)
    failureCallback()
}

function getRandomIdentifier() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    let array = new Uint32Array(2)
    window.crypto.getRandomValues(array)
    return array.join()
}

module.exports = fetchJsonResource
