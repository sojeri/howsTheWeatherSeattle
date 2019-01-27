const addClass = require('./addClass');
const getCardinalWindDirection = require('./utils/getCardinalWindDirection');

function addWindSpeed(weatherElement, speed, dataUpdateOnly) {
    document.getElementById('wind-speed').innerHTML = speed;
    if (dataUpdateOnly) return;
    
    // TODO: styles-- add sideways falling objects if windSpeed > 30 (extreme)?
    if (speed > 20) {
        addClass(weatherElement, 'wind-high');
    } else if (speed > 10) {
        addClass(weatherElement, 'wind-med');
    } else if (speed > 0) {
        addClass(weatherElement, 'wind-low');
    }

}

function addWindDirection(weatherElement, windDegrees, dataUpdateOnly) {
    let direction = getCardinalWindDirection(windDegrees);
    document.getElementById('wind-direction').innerHTML = direction;
    if (dataUpdateOnly) return;

    if (direction && direction.indexOf('W') > -1) {
        addClass(weatherElement, 'wind-west');
    } else {
        addClass(weatherElement, 'wind-east');
    }

}

function addWindToDOM(weatherElement, wind) {
    if (!wind.speed && wind.speed !== 0) {
        document.getElementByClass('wind').innerHTML = '';
        return;
    }

    const isDataOnly = !wind.speed || wind.speed == 0;
    addWindSpeed(weatherElement, wind.speed, isDataOnly);
    addWindDirection(weatherElement, wind.deg, isDataOnly);
    require('./styles/wind.scss');
}

module.exports = addWindToDOM;