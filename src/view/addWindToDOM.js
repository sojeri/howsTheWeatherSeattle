const addClass = require('./addClass');
const convertWindDegreesToCardinal = require('../data/convertWindDegreesToCardinal');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;
    let windDirection = convertWindDegreesToCardinal(wind.deg);

    if (windSpeed > 30) {
        addClass(weatherElement, 'wind-high');
    } else if (windSpeed > 15) {
        addClass(weatherElement, 'wind-medium');
    } else if (windSpeed > 0) {
        addClass(weatherElement, 'wind-low');
    }

    if (windDirection.indexOf('W') > -1) {
        addClass(weatherElement, 'wind-west');
    } else if (windDirection.indexOf('E') > -1) {
        addClass(weatherElement, 'wind-east');
    }

    document.getElementById('wind-speed').innerHTML = windSpeed;
    document.getElementById('wind-direction').innerHTML = windDirection;
}

module.exports = addWindToDOM;