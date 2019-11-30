const addClass = require('./addClass')
const getCardinalWindDirection = require('./utils/getCardinalWindDirection')

function addWindSpeed(weatherElement, speed, noAnimations) {
    document.getElementById('wind-speed').innerHTML = speed
    if (noAnimations) return

    // TODO: styles-- add sideways falling objects if windSpeed > 30 (extreme)?
    if (speed > 20) {
        addClass(weatherElement, 'wind-high')
    } else if (speed > 10) {
        addClass(weatherElement, 'wind-med')
    } else if (speed > 0) {
        addClass(weatherElement, 'wind-low')
    }
}

function addWindDirection(weatherElement, windDegrees, noAnimations) {
    let direction = getCardinalWindDirection(windDegrees)
    document.getElementById('wind-direction').innerHTML = direction
    if (noAnimations) return

    if (direction && direction.indexOf('W') > -1) {
        addClass(weatherElement, 'wind-west')
    } else {
        addClass(weatherElement, 'wind-east')
    }
}

function addWindToDOM(weatherElement, wind, isDataOnly) {
    if (!wind.speed && wind.speed !== 0) {
        document.getElementByClass('wind').innerHTML = ''
        return
    }

    const noWind = wind.speed == 0
    addWindSpeed(weatherElement, wind.speed, noWind || isDataOnly)
    addWindDirection(weatherElement, wind.deg, noWind || isDataOnly)
    require('./styles/wind.scss')
}

module.exports = addWindToDOM
