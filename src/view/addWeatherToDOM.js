const addCloudsToDOM = require('./addCloudsToDOM');
const addWeatherDataToDOM = require('./addWeatherDataToDOM');
const addWindToDOM = require('./addWindToDOM');
const addClass = require('./addClass');
const addRainToDOM = require('./addRainToDOM');
const getWeatherClassName = require('./utils/getWeatherClassName');

const cloudyWeatherTypes = ['clouds', 'snow', 'rain', 'thunder'];
function isCloudyWeather(weather) {
    return cloudyWeatherTypes.indexOf(weather) > -1;
}

const rainyWeatherTypes = ['snow', 'rain', 'thunder'];
function isRainLikeWeather(weather) {
    return rainyWeatherTypes.indexOf(weather) > -1;
}

function addWeatherToDOM(blob) {
    let weatherElement = document.getElementById('weather');
    let { baseWeatherType, weatherModifier } = getWeatherClassName(blob.weather[0].id);
    let isCloudy = isCloudyWeather(baseWeatherType);
    
    if (isCloudy) {
        addCloudsToDOM(weatherElement);
    }
    
    if (isRainLikeWeather(baseWeatherType)) {
        addRainToDOM(weatherElement, weatherModifier);

        if (baseWeatherType == 'thunder') {
            require('./styles/lightning.scss');
        }
    }
    
    if (baseWeatherType == 'mist') {
        isCloudy = true;
        require('./styles/mist.scss');
    }
    
    if (baseWeatherType == 'smoke') {
        isCloudy = true;
        require('./styles/smoke.scss');
    }

    if (isCloudy) {
        // wind animation is currently only supported for cloud & cloud-like weathers
        addWindToDOM(weatherElement, blob.wind);
    }
    
    addClass(weatherElement, baseWeatherType);
    
    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        addClass(weatherElement, 'night');
        require('./styles/night.scss');
        require('./styles/moon.scss'); // TODO: moon rise/set instead of night == moon
    }
    
    addWeatherDataToDOM(blob.main);

    setTimeout(
        () => { addClass(document.getElementById('loading'), 'loaded') },
        500);
}

module.exports = addWeatherToDOM;