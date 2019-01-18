const logError = require('../logError');
const { subscribe, unsubscribe } = require('../view/DOMutils');

function fetchJsonResource(URI, successCallback, failureCallback, isHealthyResponseCallback) {
    fetch(URI)
        .then(res => handleResponse(res, failureCallback))
        .then(blob => checkResponseBody(blob, isHealthyResponseCallback, successCallback, failureCallback))
        .catch(err => handleFailure(err, failureCallback));
}

function handleResponse(apiResponse, failureCallback) {
    if (!apiResponse.ok) return failureCallback();
    return apiResponse.json();
}

function checkResponseBody(apiResponseBlob, isHealthyApiResponseCallback, successCallback, failureCallback) {
    const next = () => {
        return isHealthyApiResponseCallback(apiResponseBlob) ?
            successCallback(apiResponseBlob) :
            failureCallback();
    };

    if (document.readyState != 'loading') {
        return next();
    }

    const subscribeId = getRandomIdentifier();
    subscribe(
        'DOMContentLoaded',
        () => { unsubscribeHandler(next, 'DOMContentLoaded', subscribeId) },
        subscribeId);
}

function unsubscribeHandler(nextCallback, eventName, eventHandlerLookup) {
    unsubscribe(eventName, eventHandlerLookup);
    nextCallback();
}

function handleFailure(error, failureCallback) {
    if (error) logError(error);
    failureCallback();
}

function getRandomIdentifier() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    let array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return array.join();
}

module.exports = fetchJsonResource;