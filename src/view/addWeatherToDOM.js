const addClass = require('./addClass');
const addCloudsToDOM = require('./addCloudsToDOM');
const addRainToDOM = require('./addRainToDOM');
const addWeatherDataToDOM = require('./addWeatherDataToDOM');
const addWindToDOM = require('./addWindToDOM');
const getWeatherClassName = require('./utils/getWeatherClassName');
const weather = require('./utils/weatherTypes');

const LOADING_THRESHOLD = 500;
function addWeatherToDOM(blob, fetchStartTime) {
    let weatherElement = document.getElementById('weather');
    require('./styles/sun-and-moon.scss');

    let { baseWeatherType, weatherModifier } = getWeatherClassName(blob.weather[0].id);

    addClass(weatherElement, baseWeatherType);
    
    let isWindSupported = false;
    if (weather.isCloudy(baseWeatherType)) {
        addCloudsToDOM(weatherElement, baseWeatherType, weatherModifier);
        isWindSupported = true; // wind animation is currently only supported for cloud-like weathers
    }

    addWindToDOM(weatherElement, blob.wind, !isWindSupported);
    
    if (weather.isRainy(baseWeatherType)) {
        addRainToDOM(weatherElement, baseWeatherType, weatherModifier);
    }
    
    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        addClass(weatherElement, 'night');
        require('./styles/night.scss');
    }
    
    addWeatherDataToDOM(blob.main);

    let next = () => { addClass(document.getElementById('loading'), 'loaded') };
    let msSinceFetchStart = Date.now() - fetchStartTime;
    if (msSinceFetchStart >= LOADING_THRESHOLD) {
        next();
    } else {
        setTimeout(next, LOADING_THRESHOLD - msSinceFetchStart);
    }
}

module.exports = addWeatherToDOM;