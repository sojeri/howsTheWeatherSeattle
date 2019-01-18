(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function convertWindDegreesToCardinal(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = convertWindDegreesToCardinal;
},{}],2:[function(require,module,exports){
const addMoonToDOM = require('../view/addMoonToDOM');
const { MOON_ENDPOINT, REPLACE, FALLBACK_MOON } = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function getDateParam(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // js 0 index month
    const day = date.getUTCDate();

    let param = year.toString();
    if (month.length < 2) param += '0';
    param += month;
    if (day.length < 2) param += '0';
    param += day;

    return param;
}

function loadMoon() {
    const date = getDateParam(new Date(Date.now()));
    fetchJsonResource(
        MOON_ENDPOINT.replace(REPLACE, date),
        addMoonToDOM,
        useFallbackMoon,
        isSuccessfulReponseBody);
}

function isSuccessfulReponseBody(blob) {
    return blob && blob.moonPhase;
}

function useFallbackMoon() {
    return addMoonToDOM(FALLBACK_MOON);
}

module.exports = loadMoon;
},{"../view/addMoonToDOM":11,"./fetchJsonResource":4,"./weatherAPIs":6}],3:[function(require,module,exports){
const addWeatherToDOM = require('../view/addWeatherToDOM');
const { WEATHER_ENDPOINT, FALLBACK_WEATHER } = require('./weatherAPIs');
const fetchJsonResource = require('./fetchJsonResource');

function loadWeather() {
    fetchJsonResource(
        WEATHER_ENDPOINT,
        addWeatherToDOM,
        useFallbackWeather,
        isSuccessfulReponseBody);
}

function isSuccessfulReponseBody(blob) {
    return blob.cod && blob.cod == 200;
}

function useFallbackWeather() {
    return addWeatherToDOM(FALLBACK_WEATHER);
}

module.exports = loadWeather;
},{"../view/addWeatherToDOM":12,"./fetchJsonResource":4,"./weatherAPIs":6}],4:[function(require,module,exports){
const logError = require('../logError');
const { subscribe, unsubscribe } = require('../view/DOMutils');

function fetchJsonResource(URI, successCallback, failureCallback, isHealthyResponseCallback) {
    fetch(URI)
        .then(res => handleResponse(res, failureCallback))
        .then(blob => checkResponseBody(blob, isHealthyResponseCallback, successCallback, failureCallback))
        .catch(err => handleFailure(err, failureCallback));
}

function handleResponse(apiResponse, failureCallback) {
    if (!apiResponse.ok) return failureCallback();
    return apiResponse.json();
}

function checkResponseBody(apiResponseBlob, isHealthyApiResponseCallback, successCallback, failureCallback) {
    const next = () => {
        return isHealthyApiResponseCallback(apiResponseBlob) ?
            successCallback(apiResponseBlob) :
            failureCallback();
    };

    if (document.readyState != 'loading') {
        return next();
    }

    const subscribeId = getRandomIdentifier();
    subscribe(
        'DOMContentLoaded',
        () => { unsubscribeHandler(next, 'DOMContentLoaded', subscribeId) },
        subscribeId);
}

function unsubscribeHandler(nextCallback, eventName, eventHandlerLookup) {
    unsubscribe(eventName, eventHandlerLookup);
    nextCallback();
}

function handleFailure(error, failureCallback) {
    if (error) logError(error);
    failureCallback();
}

function getRandomIdentifier() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    let array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    return array.join();
}

module.exports = fetchJsonResource;
},{"../logError":8,"../view/DOMutils":9}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
// https://openweathermap.org/current
const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather?id=5809844&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d';
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

// https://solunar.org/#usage
const REPLACE = '@@REPLACE@@';
const MOON_ENDPOINT = `https://api.solunar.org/solunar/47.6062,122.3321,${REPLACE},-7`
const FALLBACK_MOON = { phase: { trend: 'waning', shape: 'gibbous', }};

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    REPLACE,
    MOON_ENDPOINT,
    FALLBACK_MOON,
}
},{}],7:[function(require,module,exports){
const loadWeather = require('./data/fetchAndUpdateWeather');
const loadMoon = require('./data/fetchAndUpdateMoon');

loadWeather();
loadMoon();
},{"./data/fetchAndUpdateMoon":2,"./data/fetchAndUpdateWeather":3}],8:[function(require,module,exports){
function logError(error) {
    console.error(error.message);
}

module.exports = logError;
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
function addClass(element, newClass) {
    element.classList.add(newClass);
}

module.exports = addClass;
},{}],11:[function(require,module,exports){
const addClass = require('./addClass');

function addMoonToDOM(moonBlob, eventName, eventHandlerLookup) {
    let shapeClass, lightStartClass;
    switch (moonBlob.moonPhase) {
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
}

module.exports = addMoonToDOM;
},{"./addClass":10}],12:[function(require,module,exports){
const addWindToDOM = require('./addWindToDOM');
const addClass = require('./addClass');
const getWeatherToDraw = require('../data/getWeatherToDraw');
const { unsubscribe } = require('./DOMutils');

function addWeatherToDOM(blob, eventName, eventHandlerLookup) {
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
},{"../data/getWeatherToDraw":5,"./DOMutils":9,"./addClass":10,"./addWindToDOM":13}],13:[function(require,module,exports){
const addClass = require('./addClass');
const convertWindDegreesToCardinal = require('../data/convertWindDegreesToCardinal');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;
    let windDirection = convertWindDegreesToCardinal(wind.deg);

    if (windSpeed > 30) {
        addClass(weatherElement, 'wind-high');
    } else if (windSpeed > 15) {
        addClass(weatherElement, 'wind-medium');
    } else if (windSpeed > 0) {
        addClass(weatherElement, 'wind-low');
    }

    if (windDirection.indexOf('W') > -1) {
        addClass(weatherElement, 'wind-west');
    } else if (windDirection.indexOf('E') > -1) {
        addClass(weatherElement, 'wind-east');
    }

    document.getElementById('wind-speed').innerHTML = windSpeed;
    document.getElementById('wind-direction').innerHTML = windDirection;
}

module.exports = addWindToDOM;
},{"../data/convertWindDegreesToCardinal":1,"./addClass":10}]},{},[7]);
