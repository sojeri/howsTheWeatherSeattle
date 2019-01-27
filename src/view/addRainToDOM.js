const addClass = require('./addClass');
const weather = require('./utils/weatherTypes');

function addRainToDOM(weatherElement, rainLevel) {
    addClass(weatherElement, 'isFalling');

    switch (rainLevel) {
        case weather.severity.medium:
            require('./styles/rain-like-weather/mediumFalling.scss');
            break;
        case weather.severity.heavy:
            require('./styles/rain-like-weather/heavyFalling.scss');
            break;
        case weather.severity.light:
        default:
            require('./styles/rain-like-weather/lightFalling.scss');
            break;
    }
}

module.exports = addRainToDOM;