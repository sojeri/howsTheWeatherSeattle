const reportModuleLoaded = require('./utils/reportModuleLoaded')

// TODO: handle known AQI calcs
// https://openweathermap.org/air-pollution-index-levels
function getAqiDescription(aqi) {
    if (aqi >= 5) return 'Hazardous'
    if (aqi >= 3) return 'Unhealthy'
    if (aqi >= 2) return 'Moderate'
    return 'Good'
}

function addAqiToDOM(blob) {
    const aqi = blob.list[0].main.aqi
    const description = getAqiDescription(aqi)

    document.getElementById('aqi-description').innerHTML = description

    reportModuleLoaded('aqi')
}

module.exports = addAqiToDOM
