const addClass = require('./addClass');
const getCardinalWindDirection = require('./utils/getCardinalWindDirection');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;

    // TODO: add sideways falling objects if windSpeed > 30?
    if (windSpeed > 20) {
        addClass(weatherElement, 'wind-high');
    } else if (windSpeed > 10) {
        addClass(weatherElement, 'wind-med');
    } else if (windSpeed > 0) {
        addClass(weatherElement, 'wind-low');
    }

    document.getElementById('wind-speed').innerHTML = windSpeed;
    
    let windDirection = getCardinalWindDirection(wind.deg);
    if (windDirection) { // this property is not guaranteed to be returned by the API
        if (windDirection.indexOf('W') > -1) {
            addClass(weatherElement, 'wind-west');
        } else if (windDirection.indexOf('E') > -1) {
            addClass(weatherElement, 'wind-east');
        }
        
        document.getElementById('wind-direction').innerHTML = windDirection;
    }

    require('./styles/wind.scss');
}

module.exports = addWindToDOM;