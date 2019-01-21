const addMoonToDOM = require('../view/addMoonToDOM');
const { MOON_ENDPOINT, REPLACE, FALLBACK_MOON } = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function getDateParam(date) {
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString(); // js 0 index month
    const day = date.getUTCDate().toString();

    let param = year.toString();
    if (month.length < 2) param += '0';
    param += month;
    if (day.length < 2) param += '0';
    param += day;

    return param;
}

function loadMoon() {
    const date = getDateParam(new Date(Date.now()));
    fetchJsonResource(
        MOON_ENDPOINT.replace(REPLACE, date),
        addMoonToDOM,
        useFallbackMoon,
        isSuccessfulReponseBody);
}

function isSuccessfulReponseBody(blob) {
    return blob && blob.moonPhase;
}

function useFallbackMoon() {
    return addMoonToDOM(FALLBACK_MOON);
}

module.exports = loadMoon;