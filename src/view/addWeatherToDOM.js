const addCloudsToDOM = require('./addCloudsToDOM');
const addWindToDOM = require('./addWindToDOM');
const addClass = require('./addClass');
const getWeatherClassName = require('./utils/getWeatherClassName');

const cloudyWeathertypes = ['clouds', 'snow', 'rain', 'thunder'];
function isCloudyWeather(weather) {
    return cloudyWeathertypes.indexOf(weather) > -1;
}

function addWeatherToDOM(blob) {
    let weatherElement = document.getElementById('weather');
    let baseWeatherType = getWeatherClassName(blob.weather[0].id);

    let isCloudy = isCloudyWeather(baseWeatherType);
    
    if (isCloudy) {
        addCloudsToDOM(weatherElement);
    }
    
    if (baseWeatherType == 'snow' || baseWeatherType == 'rain' || baseWeatherType == 'thunder') {
        addClass(weatherElement, 'isFalling');
    }
    
    if (baseWeatherType == 'mist') {
        isCloudy = true;
        require('./styles/mist.scss');
    }

    if (isCloudy) {
        // wind animation is currently only supported for cloud & cloud-like weathers
        addWindToDOM(weatherElement, blob.wind);
    }
    
    addClass(weatherElement, baseWeatherType);
    

    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        require('./styles/night.scss');
        require('./styles/moon.scss'); // TODO: moon rise/set instead of night == moon
    }
    
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