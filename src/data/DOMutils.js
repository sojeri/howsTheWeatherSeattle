function subscribe(eventName, eventResponse, eventResponseLookupString) {
    window.localStorage.setItem(eventResponseLookupString, eventResponse)
    document.addEventListener(eventName, eventResponse)
}

function unsubscribe(eventName, eventResponseLookupString) {
    const listenerToClear = window.localStorage.getItem(eventResponseLookupString)
    if (listenerToClear) {
        document.removeEventListener(eventName, listenerToClear)
        window.localStorage.removeItem(eventResponseLookupString)
    }
}

function getRandomIdentifier() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    let array = new Uint32Array(2)
    window.crypto.getRandomValues(array)
    return array.join()
}

module.exports = {
    subscribe,
    unsubscribe,
    getRandomIdentifier,
}
