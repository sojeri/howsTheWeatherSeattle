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
    
    if (isCloudyWeather(baseWeatherType)) {
        addCloudsToDOM(weatherElement);
    }
    
    if (baseWeatherType == 'snow' || baseWeatherType == 'rain' || baseWeatherType == 'thunder') {
        addClass(weatherElement, 'isFalling');
    }
    
    addClass(weatherElement, baseWeatherType);
    
    addWindToDOM(weatherElement, blob.wind);

    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        require('./night.scss');
        require('./moon.scss'); // TODO: moon rise/set instead of night == moon
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