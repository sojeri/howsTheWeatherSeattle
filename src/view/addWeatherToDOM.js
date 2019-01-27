const addClass = require('./addClass');
const addCloudsToDOM = require('./addCloudsToDOM');
const addRainToDOM = require('./addRainToDOM');
const addWeatherDataToDOM = require('./addWeatherDataToDOM');
const addWindToDOM = require('./addWindToDOM');
const getWeatherClassName = require('./utils/getWeatherClassName');
const weather = require('./utils/weatherTypes');

function addWeatherToDOM(blob) {
    let weatherElement = document.getElementById('weather');
    require('./styles/sun-and-moon.scss'); // TODO: moon rise/set instead of night == moon

    let { baseWeatherType, weatherModifier } = getWeatherClassName(blob.weather[0].id);

    addClass(weatherElement, baseWeatherType);
    
    if (weather.isCloudy(baseWeatherType)) {
        addCloudsToDOM(weatherElement, baseWeatherType);
        addWindToDOM(weatherElement, blob.wind); // wind animation is currently only supported for cloud-like weathers
    }
    
    if (weather.isRainy(baseWeatherType)) {
        addRainToDOM(weatherElement, weatherModifier);
    }
    
    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        addClass(weatherElement, 'night');
        require('./styles/night.scss');
    }
    
    addWeatherDataToDOM(blob.main);

    setTimeout( // TODO: check if 500ms since PLT and call immediately instead of using timeout (use diff for timeout)
        () => { addClass(document.getElementById('loading'), 'loaded') },
        500);
}

module.exports = addWeatherToDOM;