function subscribe(eventName, eventResponse, eventResponseLookupString) {
    window.localStorage.setItem(eventResponseLookupString, eventResponse)
    document.addEventListener(eventName, eventResponse)
}

function unsubscribe(eventName, eventResponseLookupString) {
    const listenerToClear = window.localStorage.getItem(eventResponseLookupString)
    document.removeEventListener(eventName, listenerToClear)
    window.localStorage.removeItem(eventResponseLookupString)
}

module.exports = {
    subscribe,
    unsubscribe,
}
