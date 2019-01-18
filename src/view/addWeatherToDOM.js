const addWindToDOM = require('./addWindToDOM');
const addClass = require('./addClass');
const getWeatherToDraw = require('../data/getWeatherToDraw');

function addWeatherToDOM(blob) {
    let weatherElement = document.getElementById('weather');

    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        addClass(weatherElement, 'night');
    }

    let baseWeatherType = getWeatherToDraw(blob.weather[0].id);
    
    if (baseWeatherType == 'snow' || baseWeatherType == 'rain' || baseWeatherType == 'thunder') {
        addClass(weatherElement, 'isFalling');
    }
    
    addClass(weatherElement, baseWeatherType);

    addWindToDOM(weatherElement, blob.wind);

    const humidity = blob.main.humidity;
    const temp = blob.main.temp;
    const minTemp = blob.main.temp_min;
    const maxTemp = blob.main.temp_max;

    document.getElementById('humidity').innerHTML = humidity;
    document.getElementById('temp').innerHTML = temp;

    // these properties are not guaranteed to be always returned by the API
    if (minTemp && maxTemp) {
        document.getElementById('temp-min').innerHTML = minTemp;
        document.getElementById('temp-max').innerHTML = maxTemp;
    } else {
        document.getElementById('min-max').classList.add('hidden');
    }

    setTimeout(
        () => { addClass(document.getElementById('loading'), 'loaded') },
        500);
}

module.exports = addWeatherToDOM;