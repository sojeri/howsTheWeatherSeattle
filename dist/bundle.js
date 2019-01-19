(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'
/*eslint-env browser */

module.exports = {
  /**
   * Create a <style>...</style> tag and add it to the document head
   * @param {string} cssText
   * @param {object?} options
   * @return {Element}
   */
  createStyle: function (cssText, options) {
    var container = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style')
    options = options || {}
    style.type = 'text/css'
    if (options.href) {
      style.setAttribute('data-href', options.href)
    }
    if (style.sheet) { // for jsdom and IE9+
      style.innerHTML = cssText
      style.sheet.cssText = cssText
    }
    else if (style.styleSheet) { // for IE8 and below
      style.styleSheet.cssText = cssText
    }
    else { // for Chrome, Firefox, and Safari
      style.appendChild(document.createTextNode(cssText))
    }
    if (options.prepend) {
      container.insertBefore(style, container.childNodes[0]);
    } else {
      container.appendChild(style);
    }
    return style
  }
}

},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
const logError = require('./utils/logError');
const { subscribe, unsubscribe } = require('./DOMutils');

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
},{"./DOMutils":2,"./utils/logError":6}],4:[function(require,module,exports){
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
},{"../view/addMoonToDOM":11,"./fetchJsonResource":3,"./weatherAPIs":7}],5:[function(require,module,exports){
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
},{"../view/addWeatherToDOM":12,"./fetchJsonResource":3,"./weatherAPIs":7}],6:[function(require,module,exports){
function logError(error) {
    console.error(error.message);
}

module.exports = logError;
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
require('./index.scss');
const loadWeather = require('./data/loadWeather');
const loadMoon = require('./data/loadMoon');

loadWeather();
loadMoon();
},{"./data/loadMoon":4,"./data/loadWeather":5,"./index.scss":9}],9:[function(require,module,exports){
var css = ".frame{position:absolute;top:50%;left:50%;width:var(--frame-width);height:var(--frame-width);margin-top:calc(-1 * var(--half-frame-width));margin-left:calc(-1 * var(--half-frame-width));border-radius:2px;box-shadow:0 0 16px 0 rgba(0,0,0,0.2);overflow:hidden;font-family:'Droid Sans', Helvetica, sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.center{position:relative;height:100%;width:100%}#loading{z-index:4;position:absolute;height:var(--frame-width);width:var(--frame-width);background:#ccc;opacity:1;top:0;transition:all 1s}#loading.loaded{opacity:0;top:calc(-1 * var(--frame-width))}#spinner{position:absolute;top:calc(50% - .5 * var(--light-size));left:calc(50% - .5 * var(--light-size));background:#fc6;height:var(--light-size);width:var(--light-size);animation:spinHorizontal 1s ease-in-out infinite alternate;opacity:1;transition:all .3s}.loaded #spinner{opacity:0}#drop{height:calc(.5 * var(--light-size));width:calc(.5 * var(--light-size));border-bottom-right-radius:50%;border-bottom-left-radius:50%;border-top-left-radius:50%;transform:rotate(-45deg);background:#acf}@keyframes spinHorizontal{0%{transform:rotateY(0deg)}100%{background:#69f;transform:rotateY(360deg)}}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],10:[function(require,module,exports){
function addClass(element, newClass) {
    element.classList.add(newClass);
}

module.exports = addClass;
},{}],11:[function(require,module,exports){
const addClass = require('./addClass');

function addMoonToDOM(moonBlob) {
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
const getWeatherClassName = require('./utils/getWeatherClassName');

function addWeatherToDOM(blob) {
    let weatherElement = document.getElementById('weather');

    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset;
    if (isNight) {
        require('./night.scss');
    }

    let baseWeatherType = getWeatherClassName(blob.weather[0].id);
    
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
},{"./addClass":10,"./addWindToDOM":13,"./night.scss":14,"./utils/getWeatherClassName":16}],13:[function(require,module,exports){
const addClass = require('./addClass');
const getCardinalWindDirection = require('./utils/getCardinalWindDirection');

function addWindToDOM(weatherElement, wind) {
    let windSpeed = wind.speed;
    let windDirection = getCardinalWindDirection(wind.deg);

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
},{"./addClass":10,"./utils/getCardinalWindDirection":15}],14:[function(require,module,exports){
var css = "#weather{background:var(--night-overlay)}#weather #sun{visibility:hidden}#weather #moon{visibility:visible}#weather .cloud,#weather .puff{background:#999}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],15:[function(require,module,exports){
const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function getCardinalWindDirection(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = getCardinalWindDirection;
},{}],16:[function(require,module,exports){
function getWeatherClassName(weatherCode) {
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

module.exports = getWeatherClassName;
},{}]},{},[8]);
