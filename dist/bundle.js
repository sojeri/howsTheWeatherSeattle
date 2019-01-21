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
},{"../view/addWeatherToDOM":13,"./fetchJsonResource":3,"./weatherAPIs":7}],6:[function(require,module,exports){
function logError(error) {
    console.error(error.message);
}

module.exports = logError;
},{}],7:[function(require,module,exports){
// https://openweathermap.org/current
const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather?id=5809844&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d';
const FALLBACK_WEATHER = {
    weather: [{ id: 501 }],
    wind: { speed: 10, deg: 90 },
    main: {
        humidity: 84,
        temp: 52,
        temp_min: 39,
        temp_max: 61,
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
require('./view/styles/index.scss');
const loadWeather = require('./data/loadWeather');
const loadMoon = require('./data/loadMoon');

loadWeather();
loadMoon();
},{"./data/loadMoon":4,"./data/loadWeather":5,"./view/styles/index.scss":16}],9:[function(require,module,exports){
function addClass(element, newClass) {
    element.classList.add(newClass);
}

module.exports = addClass;
},{}],10:[function(require,module,exports){
const addClass = require('./addClass');

function addClouds(weatherElement) {
    addClass(weatherElement, 'clouds');
    require('./styles/clouds.scss');
}

module.exports = addClouds;
},{"./addClass":9,"./styles/clouds.scss":15}],11:[function(require,module,exports){
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
},{"./addClass":9}],12:[function(require,module,exports){
function addWeatherDataToDOM(blob) {
    const humidity = blob.humidity;
    const temp = blob.temp;
    const minTemp = blob.temp_min;
    const maxTemp = blob.temp_max;
    
    document.getElementById('humidity').innerHTML = humidity;
    document.getElementById('temp').innerHTML = temp;
    
    // these properties are not guaranteed to be always returned by the API
    if (minTemp && maxTemp) {
        document.getElementById('temp-min').innerHTML = minTemp;
        document.getElementById('temp-max').innerHTML = maxTemp;
    } else {
        document.getElementById('min-max').classList.add('hidden');
    }
}

module.exports = addWeatherDataToDOM;
},{}],13:[function(require,module,exports){
const addCloudsToDOM = require('./addCloudsToDOM');
const addWeatherDataToDOM = require('./addWeatherDataToDOM');
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
        require('./styles/isFalling.scss');
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
        require('./styles/night.scss');
        require('./styles/moon.scss'); // TODO: moon rise/set instead of night == moon
    }
    
    addWeatherDataToDOM(blob.main);

    setTimeout(
        () => { addClass(document.getElementById('loading'), 'loaded') },
        500);
}

module.exports = addWeatherToDOM;
},{"./addClass":9,"./addCloudsToDOM":10,"./addWeatherDataToDOM":12,"./addWindToDOM":14,"./styles/isFalling.scss":17,"./styles/mist.scss":18,"./styles/moon.scss":19,"./styles/night.scss":20,"./styles/smoke.scss":21,"./utils/getWeatherClassName":24}],14:[function(require,module,exports){
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

    require('./styles/wind.scss');
}

module.exports = addWindToDOM;
},{"./addClass":9,"./styles/wind.scss":22,"./utils/getCardinalWindDirection":23}],15:[function(require,module,exports){
var css = ".cloud:after,.puff:after{visibility:hidden}.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],16:[function(require,module,exports){
var css = ":root{--frame-width: 400px;--half-frame-width: 200px;--light-position: 60px;--light-size: 70px}:root{--weather-height: calc(var(--frame-width) / 5 * 4);--weather-width: var(--frame-width)}.frame{position:absolute;top:50%;left:50%;width:var(--frame-width);height:var(--frame-width);margin-top:calc(-1 * var(--half-frame-width));margin-left:calc(-1 * var(--half-frame-width));border-radius:2px;box-shadow:0 0 16px 0 rgba(0,0,0,0.2);overflow:hidden;font-family:'Droid Sans', Helvetica, sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.center{position:relative;height:100%;width:100%}#loading{z-index:5;position:absolute;height:var(--frame-width);width:var(--frame-width);background:#ccc;opacity:1;top:0;transition:all 1s}#loading.loaded{opacity:0;top:calc(-1 * var(--frame-width))}#spinner{position:absolute;top:calc(50% - .5 * var(--light-size));left:calc(50% - .5 * var(--light-size));background:#fc6;height:var(--light-size);width:var(--light-size);animation:spinHorizontal 1s ease-in-out infinite alternate;opacity:1;transition:all .3s}.loaded #spinner{opacity:0}#drop{height:calc(.5 * var(--light-size));width:calc(.5 * var(--light-size));border-bottom-right-radius:50%;border-bottom-left-radius:50%;border-top-left-radius:50%;transform:rotate(-45deg);background:#acf}@keyframes spinHorizontal{0%{transform:rotateY(0deg)}100%{background:#69f;transform:rotateY(360deg)}}#weather{height:var(--weather-height);width:var(--frame-width);position:relative;overflow:hidden}#sun,#moon{position:absolute;top:var(--light-position);left:var(--light-position);height:var(--light-size);width:var(--light-size);border-radius:50%}#sun{background:linear-gradient(#ff0, #fc0);box-shadow:0 0 10px orange}.hidden{display:none}.flex{display:flex;justify-content:center;align-items:center}.clear,.mist{background:#69f}.clouds,.rain,.snow{background:#ccf}#data{height:calc(var(--frame-width) / 5);width:var(--frame-width);flex-flow:row nowrap;justify-content:space-around;background:#ccc}.temperatures{flex-flow:column}.temperatures h2{margin:0}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],17:[function(require,module,exports){
var css = ""
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],18:[function(require,module,exports){
var css = ".cloud:after,.puff:after{visibility:hidden}.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.mist .cloud,.mist .puff,.mist .cloud:after,.mist .puff:after{background:rgba(200,200,255,0.3);transform:translateY(140px) scaleY(0.4);filter:blur(30px)}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],19:[function(require,module,exports){
var css = "#moon{background:#334;box-shadow:0 0 10px #aaa;overflow:hidden;visibility:hidden}.light-overlay{position:absolute;z-index:2;top:-1px;left:-1px;height:calc(var(--light-size) + 2px);width:calc(var(--light-size) + 2px);border-radius:50%;background:rgba(235,235,255,0.8)}.empty.light-overlay{visibility:hidden}.half .light-overlay{border-radius:0}.right.half .light-overlay{left:calc(.5 * var(--light-size))}.left.half .light-overlay{left:calc(-.5 * var(--light-size))}.gibbous .light-overlay{height:calc(1.2 * var(--light-size));top:calc(-.1 * var(--light-size))}.gibbous.left .light-overlay{left:calc(-.25 * var(--light-size))}.gibbous.right .light-overlay{left:calc(.25 * var(--light-size))}.crescent .light-overlay{border-radius:0}.crescent .light-overlay:after{content:'';position:absolute;z-index:2;top:calc(-.1 * var(--light-size));height:calc(1.2 * var(--light-size));width:var(--light-size);border-radius:50%;background:rgba(50,50,70,0.8)}.crescent.right .light-overlay:after{left:calc(-.25 * var(--light-size))}.crescent.left .light-overlay:after{left:calc(.25 * var(--light-size))}.dots{position:relative;z-index:1;border-radius:50%;height:100%;width:100%}.dot{background:#001;position:absolute;height:5px;width:5px;border-radius:50%}.dot.one{height:7px;width:7px;top:10px;left:16px}.dot.two{top:40px;left:56px}.dot.three{top:20px;left:16px}.dot.four{height:7px;width:7px;top:50px;left:18px}.dot.five{height:7px;width:7px;top:50px;left:36px}.dot.six{height:10px;width:13px;top:23px;left:42px}.dot.seven{height:10px;width:10px;top:53px;left:20px}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],20:[function(require,module,exports){
var css = "#weather{background:#136}#weather #sun{visibility:hidden}#weather #moon{visibility:visible}#weather .cloud,#weather .puff,#weather .cloud:after,#weather .puff:after{background:rgba(150,150,150,0.6)}#weather.mist .cloud,#weather.mist .puff,#weather.mist .cloud:after,#weather.mist .puff:after{background:rgba(150,150,200,0.4)}#weather.isFalling .cloud,#weather.isFalling .puff,#weather.isFalling .cloud:after,#weather.isFalling .puff:after{background:rgba(150,150,150,0.9)}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],21:[function(require,module,exports){
var css = ".cloud:after,.puff:after{visibility:hidden}.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.smoke .cloud,.smoke .puff,.smoke .cloud:after,.smoke .puff:after{background:rgba(200,150,100,0.3);transform:translateY(30px) scaleY(1.6)}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],22:[function(require,module,exports){
var css = ".cloud:after,.puff:after{content:'';left:600px;visibility:visible}.wind-west .cloud:after,.wind-west .puff:after{left:-600px}.wind-low.wind-east .cloud,.wind-low.wind-east .puff{animation:eastWind 60s infinite linear}.wind-low.wind-east.mist .cloud,.wind-low.wind-east.mist .puff{animation:eastWindMist 60s infinite linear}.wind-low.wind-west .cloud,.wind-low.wind-west .puff{animation:westWind 60s infinite linear}.wind-low.wind-west.mist .cloud,.wind-low.wind-west.mist .puff{animation:westWindMist 60s infinite linear}.wind-med.wind-east .cloud,.wind-med.wind-east .puff{animation:eastWind 40s infinite linear}.wind-med.wind-east.mist .cloud,.wind-med.wind-east.mist .puff{animation:eastWindMist 40s infinite linear}.wind-med.wind-west .cloud,.wind-med.wind-west .puff{animation:westWind 40s infinite linear}.wind-med.wind-west.mist .cloud,.wind-med.wind-west.mist .puff{animation:westWindMist 40s infinite linear}.wind-high.wind-east .cloud,.wind-high.wind-east .puff{animation:eastWind 20s infinite linear}.wind-high.wind-east.mist .cloud,.wind-high.wind-east.mist .puff{animation:eastWindMist 20s infinite linear}.wind-high.wind-west .cloud,.wind-high.wind-west .puff{animation:westWind 20s infinite linear}.wind-high.wind-west.mist .cloud,.wind-high.wind-west.mist .puff{animation:westWindMist 20s infinite linear}@keyframes eastWind{100%{transform:translateX(-600px) \"\"}}@keyframes westWind{100%{transform:translateX(600px) \"\"}}@keyframes eastWindMist{100%{transform:translateX(-600px) translateY(140px) scaleY(0.4)}}@keyframes westWindMist{100%{transform:translateX(600px) translateY(140px) scaleY(0.4)}}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],23:[function(require,module,exports){
const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function getCardinalWindDirection(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = getCardinalWindDirection;
},{}],24:[function(require,module,exports){
function getWeatherClassName(weatherCode) {
    // return 'smoke';

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
