(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function convertWindDegreesToCardinal(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = convertWindDegreesToCardinal;
},{}],2:[function(require,module,exports){
const addMoonToDOM = require('../view/addMoonToDOM'); 
const logError = require('../logError');
const { subscribe } = require('../view/DOMutils');
const { MOON_ENDPOINT, FALLBACK_MOON } = require('./weatherAPIs');

function loadMoon(unixTimestamp) {
    fetch(MOON_ENDPOINT + unixTimestamp)
        .then(handleMoonResponse)
        .then(updateMoonOnGoodResponse)
        .catch(logError);
}

function handleMoonResponse(apiResponse) {
    if (!apiResponse.ok) return useFallbackMoon();
    
    return apiResponse.json();
}

function useFallbackMoon() {
    return FALLBACK_MOON;
}

function updateMoonOnGoodResponse(jsonBlob) {
    let fallbackBlob;

    if (jsonBlob[0] && jsonBlob[0].ErrorMsg != 'success') fallbackBlob = FALLBACK_MOON;

    
    if (document.readyState != 'loading') {
        return addMoonToDOM(fallbackBlob || jsonBlob);
    }

    subscribe(
        'DOMContentLoaded',
        () => { addMoonToDOM(fallbackBlob || jsonBlob, 'DOMContentLoaded', 'weatherEventListener') },
        'weatherEventListener');
}

module.exports = loadMoon;
},{"../logError":7,"../view/DOMutils":8,"../view/addMoonToDOM":10,"./weatherAPIs":5}],3:[function(require,module,exports){
const addWeatherToDOM = require('../view/addWeatherToDOM'); 
const logError = require('../logError');
const { subscribe } = require('../view/DOMutils');
const { WEATHER_ENDPOINT, FALLBACK_WEATHER } = require('./weatherAPIs');

function loadWeather() {
    fetch(WEATHER_ENDPOINT)
        .then(handleWeatherResponse)
        .then(updateWeatherOnGoodResponse)
        .catch(logError);
}

function handleWeatherResponse(apiResponse) {
    if (!apiResponse.ok) return useFallbackWeather();
    
    return apiResponse.json();
}

function useFallbackWeather() {
    return FALLBACK_WEATHER;
}

function updateWeatherOnGoodResponse(jsonBlob) {
    let fallbackBlob;

    if (jsonBlob.cod != 200) fallbackBlob = FALLBACK_WEATHER;

    if (document.readyState != 'loading') {
        addWeatherToDOM(fallbackBlob || jsonBlob)
    }

    subscribe(
        'DOMContentLoaded',
        () => { addWeatherToDOM(fallbackBlob || jsonBlob, 'DOMContentLoaded', 'weatherEventListener') },
        'weatherEventListener');
}

module.exports = loadWeather;
},{"../logError":7,"../view/DOMutils":8,"../view/addWeatherToDOM":12,"./weatherAPIs":5}],4:[function(require,module,exports){
function getWeatherToDraw(weatherCode) {
    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 801 || weatherCode == 771) return 'clouds';
    if (weatherCode == 701 || weatherCode == 741) return 'mist';
    if (weatherCode >= 711 && weatherCode <= 762) return 'smoke';
    if (weatherCode == 800 || weatherCode > 762) return 'clear';
    if (weatherCode >= 600) return 'snow';
    if (weatherCode >= 300) return 'rain'; // 300s drizzle 500s rain incl light
    if (weatherCode >= 200) return 'thunder';
    
    throw new Error('unrecognized weather code!');
}

module.exports = getWeatherToDraw;
},{}],5:[function(require,module,exports){
const WEATHER_ENDPOINT = 'http://api.openweathermap.org/data/2.5/weather?id=5809844&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d';
const FALLBACK_WEATHER = {
    weather: { id: 501 },
    wind: { speed: 10, deg: 90 },
    main: {
        humidity: 87,
        temp: 12,
        temp_min: 9,
        temp_max: 21,
    },
    sys: { sunrise: 1, sunset: 3, },
    dt: 2,
};
/**
 * good response
 * {
 *   "coord": {"lon":-0.13,"lat":51.51},
 *   "weather":[{"id":300,"main":"Drizzle","description":"light intensity drizzle","icon":"09d"}],
 *   "base":"stations",
 *   "main":{
 *      "temp":32.94,
 *      "pressure":1012,
 *      "humidity":81,
 *      "temp_min":24.8,
 *      "temp_max":42.98},
 *   "visibility":10000,
 *   "wind":{"speed":4.1,"deg":80},
 *   "clouds":{"all":90},
 *   "dt":1485789600,
 *   "sys":{"type":1,"id":5091,"message":0.0103,"country":"GB","sunrise":1485762037,"sunset":1485794875},
 *   "id":2643743,
 *   "name":"London",
 *   "cod":200
 * }
 * 
 * bad response:
 * {
 *   "cod":401,
 *   "message": "Invalid API key. Please see http://openweathermap.org/faq#error401 for more info."
 * }
 */

const MOON_ENDPOINT = 'http://api.farmsense.net/v1/moonphases/?d=';
const FALLBACK_MOON = [{ Phase: 'Waxing Crescent' }];

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    MOON_ENDPOINT,
    FALLBACK_MOON,
}
},{}],6:[function(require,module,exports){
const loadWeather = require('./data/fetchAndUpdateWeather');
const loadMoon = require('./data/fetchAndUpdateMoon');

loadWeather();
loadMoon(Math.floor(Date.now() / 1000));
},{"./data/fetchAndUpdateMoon":2,"./data/fetchAndUpdateWeather":3}],7:[function(require,module,exports){
function logError(error) {
    console.error(error.message);
}

module.exports = logError;
},{}],8:[function(require,module,exports){
function subscribe(eventName, eventResponse, eventResponseLookupString) {
    window.localStorage.setItem(eventResponseLookupString, eventResponse);
    document.addEventListener(eventName, eventResponse);
}

function unsubscribe(eventName, eventResponseLookupString) {
    const listenerToClear = window.localStorage.getItem(eventResponseLookupString);
    document.removeEventListener(eventName, listenerToClear);
    window.localStorage.removeItem(eventResponseLookupString);
}

module.exports = {
    subscribe,
    unsubscribe,
}
},{}],9:[function(require,module,exports){
function addClass(element, newClass) {
    element.classList.add(newClass);
}

module.exports = addClass;
},{}],10:[function(require,module,exports){
const addClass = require('./addClass');

function addMoonToDOM(moonBlob, eventName, eventHandlerLookup) {
    if (eventName && eventHandlerLookup) unsubscribe(eventName, eventHandlerLookup);

    let phase = moonBlob[0].Phase;
    let shapeClass, lightStartClass;
    switch (phase) {
        case 'New Moon':
            shapeClass = 'empty';
            break;
        case 'Waxing Crescent':
            shapeClass = 'crescent';
            lightStartClass = 'right';
            break;
        case 'First Quarter':
            shapeClass = 'half';
            lightStartClass = 'right';
            break;
        case 'Waxing Gibbous':
            shapeClass = 'gibbous';
            lightStartClass = 'right';
            break;
        case 'Full Moon':
            shapeClass = 'full';
            break;
        case 'Waning Gibbous':
            shapeClass = 'gibbous';
            lightStartClass = 'left';
            break;
        case 'Third Quarter':
            shapeClass = 'half';
            lightStartClass = 'left';
            break;
        case 'Waning Crescent':
            shapeClass = 'crescent';
            lightStartClass = 'left';
            break;
        default:
            throw new Error('unrecognized moon phase');
    }

    let moonElement = document.getElementById('moon');

    addClass(moonElement, shapeClass);
    if (lightStartClass) addClass(moonElement, lightStartClass);

    console.log(phase);
}

module.exports = addMoonToDOM;
},{"./addClass":9}],11:[function(require,module,exports){
function addWeatherDescriptor(weatherElement, descriptor) {
    weatherElement.classList.add(descriptor);
}

module.exports = addWeatherDescriptor;
},{}],12:[function(require,module,exports){
const addWindToDOM = require('./addWindToDOM');
const addClass = require('./addClass');
const getWeatherToDraw = require('../data/getWeatherToDraw');
const { unsubscribe } = require('./DOMutils');

function addWeatherToDOM(blob, eventName, eventHandlerLookup) {
    if (eventName && eventHandlerLookup) unsubscribe(eventName, eventHandlerLookup);
    
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
},{"../data/getWeatherToDraw":4,"./DOMutils":8,"./addClass":9,"./addWindToDOM":13}],13:[function(require,module,exports){
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
},{"../data/convertWindDegreesToCardinal":1,"./addWeatherDescriptor":11}]},{},[6]);
