const addClass = require('./addClass');
const getCardinalWindDirection = require('./utils/getCardinalWindDirection');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;
    if (windSpeed > 30) {
        addClass(weatherElement, 'wind-high');
    } else if (windSpeed > 15) {
        addClass(weatherElement, 'wind-medium');
    } else if (windSpeed > 0) {
        addClass(weatherElement, 'wind-low');
    }

    document.getElementById('wind-speed').innerHTML = windSpeed;
    
    let windDirection = getCardinalWindDirection(wind.deg);
    // this property is not guaranteed to be returned by the API
    if (windDirection) {
        if (windDirection.indexOf('W') > -1) {
            addClass(weatherElement, 'wind-west');
        } else if (windDirection.indexOf('E') > -1) {
            addClass(weatherElement, 'wind-east');
        }
        
        document.getElementById('wind-direction').innerHTML = windDirection;
    }
}

module.exports = addWindToDOM;