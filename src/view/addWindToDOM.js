const addWeatherDescriptor = require('./addWeatherDescriptor');
const convertWindDegreesToCardinal = require('../data/convertWindDegreesToCardinal');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;
    let windDirection = convertWindDegreesToCardinal(wind.deg);

    if (windSpeed > 30) {
        addWeatherDescriptor(weatherElement, 'wind-high');
    } else if (windSpeed > 15) {
        addWeatherDescriptor(weatherElement, 'wind-medium');
    } else if (windSpeed > 0) {
        addWeatherDescriptor(weatherElement, 'wind-low');
    }

    if (windDirection.indexOf('W') > -1) {
        addWeatherDescriptor(weatherElement, 'wind-west');
    } else if (windDirection.indexOf('E') > -1) {
        addWeatherDescriptor(weatherElement, 'wind-east');
    }

    document.getElementById('wind-speed').innerHTML = windSpeed;
    document.getElementById('wind-direction').innerHTML = windDirection;
}

module.exports = addWindToDOM;