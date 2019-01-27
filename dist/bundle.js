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
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString(); // js 0 index month
    const day = date.getUTCDate().toString();

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
},{"../view/addWeatherToDOM":14,"./fetchJsonResource":3,"./weatherAPIs":7}],6:[function(require,module,exports){
function logError(error) {
    console.error(error.message);
}

module.exports = logError;
},{}],7:[function(require,module,exports){
const SEATTLE_LAT = '47.5922116';
const SEATTLE_LONG = '-122.3205388';

// https://openweathermap.org/current
const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d`;
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
const MOON_ENDPOINT = `https://api.solunar.org/solunar/${SEATTLE_LAT},${SEATTLE_LONG},${REPLACE},-7`
const FALLBACK_MOON = { moonPhase: 'Waxing Crescent', };

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
},{"./data/loadMoon":4,"./data/loadWeather":5,"./view/styles/index.scss":20}],9:[function(require,module,exports){
function addClass(element, newClass) {
    element.classList.add(newClass);
}

module.exports = addClass;
},{}],10:[function(require,module,exports){
const addClass = require('./addClass');
const weather = require('./utils/weatherTypes');

function addCloudLikeWeather(weatherElement, weatherType) {
    addClass(weatherElement, 'clouds');

    switch (weatherType) {
        case weather.mist:
            require('./styles/cloud-like-weather/mist.scss');
            break;
        case weather.smoke:
            require('./styles/cloud-like-weather/smoke.scss');
            break;
        case weather.clouds:
            require('./styles/cloud-like-weather/clouds.scss');
            break;
        case weather.lightning:
            require('./styles/cloud-like-weather/lightning.scss');
            break;
    }
}

module.exports = addCloudLikeWeather;
},{"./addClass":9,"./styles/cloud-like-weather/clouds.scss":16,"./styles/cloud-like-weather/lightning.scss":17,"./styles/cloud-like-weather/mist.scss":18,"./styles/cloud-like-weather/smoke.scss":19,"./utils/weatherTypes":29}],11:[function(require,module,exports){
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
const addClass = require('./addClass');
const weather = require('./utils/weatherTypes');

function addRainToDOM(weatherElement, rainLevel) {
    addClass(weatherElement, 'isFalling');

    switch (rainLevel) {
        case weather.severity.medium:
            require('./styles/rain-like-weather/mediumFalling.scss');
            break;
        case weather.severity.heavy:
            require('./styles/rain-like-weather/heavyFalling.scss');
            break;
        case weather.severity.light:
        default:
            require('./styles/rain-like-weather/lightFalling.scss');
            break;
    }
}

module.exports = addRainToDOM;
},{"./addClass":9,"./styles/rain-like-weather/heavyFalling.scss":22,"./styles/rain-like-weather/lightFalling.scss":23,"./styles/rain-like-weather/mediumFalling.scss":24,"./utils/weatherTypes":29}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{"./addClass":9,"./addCloudsToDOM":10,"./addRainToDOM":12,"./addWeatherDataToDOM":13,"./addWindToDOM":15,"./styles/night.scss":21,"./styles/sun-and-moon.scss":25,"./utils/getWeatherClassName":28,"./utils/weatherTypes":29}],15:[function(require,module,exports){
const addClass = require('./addClass');
const getCardinalWindDirection = require('./utils/getCardinalWindDirection');

function addWindSpeed(weatherElement, speed, dataUpdateOnly) {
    document.getElementById('wind-speed').innerHTML = speed;
    if (dataUpdateOnly) return;
    
    // TODO: styles-- add sideways falling objects if windSpeed > 30 (extreme)?
    if (speed > 20) {
        addClass(weatherElement, 'wind-high');
    } else if (speed > 10) {
        addClass(weatherElement, 'wind-med');
    } else if (speed > 0) {
        addClass(weatherElement, 'wind-low');
    }

}

function addWindDirection(weatherElement, windDegrees, dataUpdateOnly) {
    let direction = getCardinalWindDirection(windDegrees);
    document.getElementById('wind-direction').innerHTML = direction;
    if (dataUpdateOnly) return;

    if (direction && direction.indexOf('W') > -1) {
        addClass(weatherElement, 'wind-west');
    } else {
        addClass(weatherElement, 'wind-east');
    }

}

function addWindToDOM(weatherElement, wind) {
    if (!wind.speed && wind.speed !== 0) {
        document.getElementByClass('wind').innerHTML = '';
        return;
    }

    const isDataOnly = !wind.speed || wind.speed == 0;
    addWindSpeed(weatherElement, wind.speed, isDataOnly);
    addWindDirection(weatherElement, wind.deg, isDataOnly);
    require('./styles/wind.scss');
}

module.exports = addWindToDOM;
},{"./addClass":9,"./styles/wind.scss":26,"./utils/getCardinalWindDirection":27}],16:[function(require,module,exports){
var css = ".cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],17:[function(require,module,exports){
var css = "#lightning{z-index:5;position:absolute;top:0;left:0;height:var(--weather-height);width:var(--frame-width);opacity:0;animation:lightningDay 6s linear infinite -4s}.night #lightning{animation:lightningNight 6s linear infinite -4s}@keyframes lightningDay{98.5%{opacity:0}99%{opacity:1;background:#ffffe6}100%{opacity:0}}@keyframes lightningNight{98.5%{opacity:0}99%{opacity:1;background:#ffffc8}100%{opacity:0}}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],18:[function(require,module,exports){
var css = ".cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.mist .cloud,.mist .puff,.mist .cloud:after,.mist .puff:after{background:rgba(200,200,255,0.5);transform:translateY(140px) scaleY(0.4);filter:blur(30px)}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],19:[function(require,module,exports){
var css = ".cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.7);border-radius:50%;z-index:4}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.9)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.smoke .cloud,.smoke .puff,.smoke .cloud:after,.smoke .puff:after{background:rgba(200,160,120,0.3);transform:translateX(-80px) translateY(30px) scaleY(2.5);filter:blur(30px)}.smoke #sun{opacity:.8}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],20:[function(require,module,exports){
var css = "#generic-skyline:before,#generic-skyline:after{content:'';position:absolute}#generic-skyline:before,#generic-skyline:after{content:'';position:absolute}#generic-skyline:before,#generic-skyline:after{height:100%;width:100%}#generic-skyline{position:absolute;top:65%;height:40%;width:80%;left:20%;background:#666;clip-path:polygon(0% 100%, 0% 70%, 17% 70%, 17% 47%, 22% 46%, 22% 68%, 23% 68%, 24% 63%, 25% 57%, 27% 63%, 28% 35%, 31% 35%, 34% 30%, 36% 35%, 38% 35%, 38% 48%, 42% 48%, 43% 40%, 45% 40%, 52% 38%, 53% 50%, 51% 50%, 55% 51%, 55% 26%, 57% 22%, 58% 17%, 63% 17%, 64% 57%, 67% 57%, 68% 43%, 72% 43%, 73% 25%, 77% 24%, 78% 50%, 80% 54%, 84% 54%, 84% 48%, 88% 48%, 89% 39%, 94% 39%, 94% 30%, 100% 29%, 100% 100%)}#generic-skyline:before{background:rgba(255,255,255,0.2);clip-path:polygon(28% 35%, 31% 35%, 34% 30%, 36% 35%)}#generic-skyline:after{background:rgba(100,200,200,0.5);clip-path:polygon(57% 22%, 58% 17%, 63% 17%, 61% 23%)}#extra-skyline{position:absolute;top:94%;height:8%;width:20%;background:#666}.night #generic-skyline,.night #extra-skyline{background:#123}.night #generic-skyline:before{background:rgba(51,204,255,0.4)}.night #generic-skyline:after{background:#123}@keyframes wheel{25%{transform:rotate(360deg);border-color:#f36;box-shadow:0 0 8px 1px #f36}50%{transform:rotate(720deg);border-color:#fff;box-shadow:0 0 8px 1px #fff}75%{transform:rotate(1080deg);border-color:#fc6;box-shadow:0 0 8px 1px #fc6}100%{transform:rotate(1440deg);border-color:#3cf;box-shadow:0 0 8px 1px #3cf}}@keyframes spoke{20%{background:#f36}40%{background:#fc6}60%{background:radial-gradient(ellipse at 50%, #3cf, #3cf 10%, #29c 20%, #000 35%, #fc6 90%)}80%{background:#3cf}100%{background:#3f6}}#great-wheel{position:absolute;top:88%;left:1%;height:40px;width:40px;border-radius:50%;box-sizing:border-box;overflow:hidden;border:2px solid #333}#great-wheel .spoke{position:absolute;top:-6px;left:-22px;height:50px;width:80px;background:#444}#great-wheel .spoke-1{clip-path:polygon(48% 0, 51% 0, 51% 100%, 48% 100%)}#great-wheel .spoke-2{clip-path:polygon(3% 0, 0 3%, 97% 100%, 100% 97%)}#great-wheel .spoke-3{clip-path:polygon(97% 0, 100% 3%, 3% 100%, 0 97%)}#great-wheel .spoke-4{clip-path:polygon(30% 100%, 33% 100%, 70% 0, 67% 0)}#great-wheel .spoke-5{clip-path:polygon(67% 100%, 70% 100%, 33% 0, 30% 0)}#great-wheel .spoke-6{clip-path:polygon(100% 62%, 100% 66%, 0 38%, 0 34%)}#great-wheel .spoke-7{clip-path:polygon(0 64%, 0 68%, 100% 36%, 100% 32%)}.night #great-wheel{animation:wheel 60s ease-in-out infinite;border-color:#3f6;box-shadow:0 0 8px 1px #3f6}.night #great-wheel .spoke{background:radial-gradient(ellipse at 50%, #96f, #96f 10%, #fff 20%, #000 35%, #3f6 90%);animation:spoke 100s linear infinite alternate}#smith-tower{position:absolute;top:80%;left:34%;height:22%;width:10%;background:#aaa;clip-path:polygon(0% 100%, 0% 20%, 15% 0, 30% 20%, 30% 60%, 100% 60%, 100% 100%)}#smith-tower-globe{content:'';position:absolute;top:79.5%;left:35.2%;height:2px;width:2px;border-radius:50%;background:#fff;box-shadow:0 0 0 0 #fff}.night #smith-tower{background:#345}.night #smith-tower-globe{background:#3cf;box-shadow:0 0 8px 1px #3cf}.columbia-tower{background:#456;position:absolute;top:65%;left:54%}.night .columbia-tower{background:#012}.night .columbia-tower:after{content:'';position:absolute;height:1px;width:100%;background:#e2f;box-shadow:0 0 4px 1px #e2f}.columbia-tower-1{height:35%;width:4%}.columbia-tower-2{height:30%;width:5%;top:70%}.columbia-tower-3{height:20%;width:1%;top:80%;left:58.5%}:root{--frame-width: 400px;--half-frame-width: 200px;--light-position: 60px;--light-size: 70px}:root{--weather-height: calc(var(--frame-width) / 5 * 4);--weather-width: var(--frame-width)}.frame{position:absolute;top:50%;left:50%;width:var(--frame-width);height:var(--frame-width);margin-top:calc(-1 * var(--half-frame-width));margin-left:calc(-1 * var(--half-frame-width));border-radius:2px;box-shadow:0 0 16px 0 rgba(0,0,0,0.2);overflow:hidden;font-family:'Droid Sans', Helvetica, sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.center{position:relative;height:100%;width:100%}#loading{z-index:5;position:absolute;height:var(--frame-width);width:var(--frame-width);background:#ccc;opacity:1;top:0;transition:all 1s}#loading.loaded{opacity:0;top:calc(-1 * var(--frame-width))}#spinner{position:absolute;top:calc(50% - .5 * var(--light-size));left:calc(50% - .5 * var(--light-size));background:#fc6;height:var(--light-size);width:var(--light-size);animation:spinHorizontal 1s ease-in-out infinite alternate;opacity:1;transition:all .3s}.loaded #spinner{opacity:0}#drop{height:calc(.5 * var(--light-size));width:calc(.5 * var(--light-size));border-bottom-right-radius:50%;border-bottom-left-radius:50%;border-top-left-radius:50%;transform:rotate(-45deg);background:#acf}@keyframes spinHorizontal{0%{transform:rotateY(0deg)}100%{background:#69f;transform:rotateY(360deg)}}#weather{height:var(--weather-height);width:var(--frame-width);position:relative;overflow:hidden}.hidden{display:none}.flex{display:flex;justify-content:center;align-items:center}.clear,.mist,.smoke{background:#69f}.clouds,.rain,.snow{background:#ccf}#data{height:calc(var(--frame-width) / 5);width:var(--frame-width);flex-flow:row nowrap;justify-content:space-around;background:#ccc}.temperatures{flex-flow:column}.temperatures h2{margin:0}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],21:[function(require,module,exports){
var css = "#weather{background:#136}#weather #sun{visibility:hidden}#weather #moon{visibility:visible}#weather .cloud,#weather .puff,#weather .cloud:after,#weather .puff:after{background:rgba(150,150,150,0.6)}#weather.mist .cloud,#weather.mist .puff,#weather.mist .cloud:after,#weather.mist .puff:after{background:rgba(150,150,200,0.4)}#weather.smoke .cloud,#weather.smoke .puff,#weather.smoke .cloud:after,#weather.smoke .puff:after{background:rgba(150,100,50,0.2)}#weather.isFalling .cloud,#weather.isFalling .puff,#weather.isFalling .cloud:after,#weather.isFalling .puff:after{background:rgba(150,150,150,0.9)}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],22:[function(require,module,exports){
var css = ".isFalling .weather{z-index:3;position:absolute;top:-10px;opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 1.6s infinite linear 1.1s}.wind-east .tiny.weather-1{animation:falling-1-east 1.6s infinite linear 1.1s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 1.6s infinite linear 1.1s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 1.6s infinite linear 1.1s}.wind-west .tiny.weather-1{animation:falling-1-west 1.6s infinite linear 1.1s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 1.6s infinite linear 1.1s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 1.6s infinite linear 1.1s}.tiny.weather-2{animation:falling-2 1.5s infinite linear .6s}.wind-east .tiny.weather-2{animation:falling-2-east 1.5s infinite linear .6s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 1.5s infinite linear .6s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 1.5s infinite linear .6s}.wind-west .tiny.weather-2{animation:falling-2-west 1.5s infinite linear .6s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 1.5s infinite linear .6s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 1.5s infinite linear .6s}.tiny.weather-3{animation:falling-3 1.5s infinite linear .6s}.wind-east .tiny.weather-3{animation:falling-3-east 1.5s infinite linear .6s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 1.5s infinite linear .6s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 1.5s infinite linear .6s}.wind-west .tiny.weather-3{animation:falling-3-west 1.5s infinite linear .6s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 1.5s infinite linear .6s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 1.5s infinite linear .6s}.tiny.weather-4{animation:falling-4 2.3s infinite linear .9s}.wind-east .tiny.weather-4{animation:falling-4-east 2.3s infinite linear .9s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 2.3s infinite linear .9s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 2.3s infinite linear .9s}.wind-west .tiny.weather-4{animation:falling-4-west 2.3s infinite linear .9s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 2.3s infinite linear .9s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 2.3s infinite linear .9s}.tiny.weather-5{animation:falling-5 2.1s infinite linear .4s}.wind-east .tiny.weather-5{animation:falling-5-east 2.1s infinite linear .4s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 2.1s infinite linear .4s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 2.1s infinite linear .4s}.wind-west .tiny.weather-5{animation:falling-5-west 2.1s infinite linear .4s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 2.1s infinite linear .4s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 2.1s infinite linear .4s}.tiny.weather-6{animation:falling-6 2.8s infinite linear .3s}.wind-east .tiny.weather-6{animation:falling-6-east 2.8s infinite linear .3s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 2.8s infinite linear .3s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 2.8s infinite linear .3s}.wind-west .tiny.weather-6{animation:falling-6-west 2.8s infinite linear .3s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 2.8s infinite linear .3s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 2.8s infinite linear .3s}.tiny.weather-7{animation:falling-7 1.1s infinite linear .6s}.wind-east .tiny.weather-7{animation:falling-7-east 1.1s infinite linear .6s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 1.1s infinite linear .6s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 1.1s infinite linear .6s}.wind-west .tiny.weather-7{animation:falling-7-west 1.1s infinite linear .6s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 1.1s infinite linear .6s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 1.1s infinite linear .6s}.tiny.weather-8{animation:falling-8 1.9s infinite linear .6s}.wind-east .tiny.weather-8{animation:falling-8-east 1.9s infinite linear .6s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 1.9s infinite linear .6s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 1.9s infinite linear .6s}.wind-west .tiny.weather-8{animation:falling-8-west 1.9s infinite linear .6s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 1.9s infinite linear .6s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 1.9s infinite linear .6s}.tiny.weather-9{animation:falling-9 2.2s infinite linear .4s}.wind-east .tiny.weather-9{animation:falling-9-east 2.2s infinite linear .4s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 2.2s infinite linear .4s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 2.2s infinite linear .4s}.wind-west .tiny.weather-9{animation:falling-9-west 2.2s infinite linear .4s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 2.2s infinite linear .4s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 2.2s infinite linear .4s}.tiny.weather-10{animation:falling-10 1.6s infinite linear .4s}.wind-east .tiny.weather-10{animation:falling-10-east 1.6s infinite linear .4s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 1.6s infinite linear .4s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 1.6s infinite linear .4s}.wind-west .tiny.weather-10{animation:falling-10-west 1.6s infinite linear .4s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 1.6s infinite linear .4s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 1.6s infinite linear .4s}.small.weather{height:26px;width:13px;background:rgba(100,130,255,0.75)}.small.weather-1{animation:falling-1 2.6s infinite linear 1.5s}.wind-east .small.weather-1{animation:falling-1-east 2.6s infinite linear 1.5s}.wind-east.wind-med .small.weather-1{animation:falling-1-east-med 2.6s infinite linear 1.5s}.wind-east.wind-high .small.weather-1{animation:falling-1-east-high 2.6s infinite linear 1.5s}.wind-west .small.weather-1{animation:falling-1-west 2.6s infinite linear 1.5s}.wind-west.wind-med .small.weather-1{animation:falling-1-west-med 2.6s infinite linear 1.5s}.wind-west.wind-high .small.weather-1{animation:falling-1-west-high 2.6s infinite linear 1.5s}.small.weather-2{animation:falling-2 2.2s infinite linear .1s}.wind-east .small.weather-2{animation:falling-2-east 2.2s infinite linear .1s}.wind-east.wind-med .small.weather-2{animation:falling-2-east-med 2.2s infinite linear .1s}.wind-east.wind-high .small.weather-2{animation:falling-2-east-high 2.2s infinite linear .1s}.wind-west .small.weather-2{animation:falling-2-west 2.2s infinite linear .1s}.wind-west.wind-med .small.weather-2{animation:falling-2-west-med 2.2s infinite linear .1s}.wind-west.wind-high .small.weather-2{animation:falling-2-west-high 2.2s infinite linear .1s}.small.weather-3{animation:falling-3 1.5s infinite linear .9s}.wind-east .small.weather-3{animation:falling-3-east 1.5s infinite linear .9s}.wind-east.wind-med .small.weather-3{animation:falling-3-east-med 1.5s infinite linear .9s}.wind-east.wind-high .small.weather-3{animation:falling-3-east-high 1.5s infinite linear .9s}.wind-west .small.weather-3{animation:falling-3-west 1.5s infinite linear .9s}.wind-west.wind-med .small.weather-3{animation:falling-3-west-med 1.5s infinite linear .9s}.wind-west.wind-high .small.weather-3{animation:falling-3-west-high 1.5s infinite linear .9s}.small.weather-4{animation:falling-4 1.4s infinite linear .8s}.wind-east .small.weather-4{animation:falling-4-east 1.4s infinite linear .8s}.wind-east.wind-med .small.weather-4{animation:falling-4-east-med 1.4s infinite linear .8s}.wind-east.wind-high .small.weather-4{animation:falling-4-east-high 1.4s infinite linear .8s}.wind-west .small.weather-4{animation:falling-4-west 1.4s infinite linear .8s}.wind-west.wind-med .small.weather-4{animation:falling-4-west-med 1.4s infinite linear .8s}.wind-west.wind-high .small.weather-4{animation:falling-4-west-high 1.4s infinite linear .8s}.small.weather-5{animation:falling-5 2.6s infinite linear .4s}.wind-east .small.weather-5{animation:falling-5-east 2.6s infinite linear .4s}.wind-east.wind-med .small.weather-5{animation:falling-5-east-med 2.6s infinite linear .4s}.wind-east.wind-high .small.weather-5{animation:falling-5-east-high 2.6s infinite linear .4s}.wind-west .small.weather-5{animation:falling-5-west 2.6s infinite linear .4s}.wind-west.wind-med .small.weather-5{animation:falling-5-west-med 2.6s infinite linear .4s}.wind-west.wind-high .small.weather-5{animation:falling-5-west-high 2.6s infinite linear .4s}.small.weather-6{animation:falling-6 2.8s infinite linear 1.2s}.wind-east .small.weather-6{animation:falling-6-east 2.8s infinite linear 1.2s}.wind-east.wind-med .small.weather-6{animation:falling-6-east-med 2.8s infinite linear 1.2s}.wind-east.wind-high .small.weather-6{animation:falling-6-east-high 2.8s infinite linear 1.2s}.wind-west .small.weather-6{animation:falling-6-west 2.8s infinite linear 1.2s}.wind-west.wind-med .small.weather-6{animation:falling-6-west-med 2.8s infinite linear 1.2s}.wind-west.wind-high .small.weather-6{animation:falling-6-west-high 2.8s infinite linear 1.2s}.small.weather-7{animation:falling-7 1.4s infinite linear .7s}.wind-east .small.weather-7{animation:falling-7-east 1.4s infinite linear .7s}.wind-east.wind-med .small.weather-7{animation:falling-7-east-med 1.4s infinite linear .7s}.wind-east.wind-high .small.weather-7{animation:falling-7-east-high 1.4s infinite linear .7s}.wind-west .small.weather-7{animation:falling-7-west 1.4s infinite linear .7s}.wind-west.wind-med .small.weather-7{animation:falling-7-west-med 1.4s infinite linear .7s}.wind-west.wind-high .small.weather-7{animation:falling-7-west-high 1.4s infinite linear .7s}.small.weather-8{animation:falling-8 2.4s infinite linear 1.2s}.wind-east .small.weather-8{animation:falling-8-east 2.4s infinite linear 1.2s}.wind-east.wind-med .small.weather-8{animation:falling-8-east-med 2.4s infinite linear 1.2s}.wind-east.wind-high .small.weather-8{animation:falling-8-east-high 2.4s infinite linear 1.2s}.wind-west .small.weather-8{animation:falling-8-west 2.4s infinite linear 1.2s}.wind-west.wind-med .small.weather-8{animation:falling-8-west-med 2.4s infinite linear 1.2s}.wind-west.wind-high .small.weather-8{animation:falling-8-west-high 2.4s infinite linear 1.2s}.small.weather-9{animation:falling-9 2.1s infinite linear .6s}.wind-east .small.weather-9{animation:falling-9-east 2.1s infinite linear .6s}.wind-east.wind-med .small.weather-9{animation:falling-9-east-med 2.1s infinite linear .6s}.wind-east.wind-high .small.weather-9{animation:falling-9-east-high 2.1s infinite linear .6s}.wind-west .small.weather-9{animation:falling-9-west 2.1s infinite linear .6s}.wind-west.wind-med .small.weather-9{animation:falling-9-west-med 2.1s infinite linear .6s}.wind-west.wind-high .small.weather-9{animation:falling-9-west-high 2.1s infinite linear .6s}.small.weather-10{animation:falling-10 1.7s infinite linear .3s}.wind-east .small.weather-10{animation:falling-10-east 1.7s infinite linear .3s}.wind-east.wind-med .small.weather-10{animation:falling-10-east-med 1.7s infinite linear .3s}.wind-east.wind-high .small.weather-10{animation:falling-10-east-high 1.7s infinite linear .3s}.wind-west .small.weather-10{animation:falling-10-west 1.7s infinite linear .3s}.wind-west.wind-med .small.weather-10{animation:falling-10-west-med 1.7s infinite linear .3s}.wind-west.wind-high .small.weather-10{animation:falling-10-west-high 1.7s infinite linear .3s}.large.weather{height:30px;width:16px;background:rgba(100,130,255,0.9)}.large.weather-1{animation:falling-1 1.3s infinite linear 1.2s}.wind-east .large.weather-1{animation:falling-1-east 1.3s infinite linear 1.2s}.wind-east.wind-med .large.weather-1{animation:falling-1-east-med 1.3s infinite linear 1.2s}.wind-east.wind-high .large.weather-1{animation:falling-1-east-high 1.3s infinite linear 1.2s}.wind-west .large.weather-1{animation:falling-1-west 1.3s infinite linear 1.2s}.wind-west.wind-med .large.weather-1{animation:falling-1-west-med 1.3s infinite linear 1.2s}.wind-west.wind-high .large.weather-1{animation:falling-1-west-high 1.3s infinite linear 1.2s}.large.weather-2{animation:falling-2 2.2s infinite linear .7s}.wind-east .large.weather-2{animation:falling-2-east 2.2s infinite linear .7s}.wind-east.wind-med .large.weather-2{animation:falling-2-east-med 2.2s infinite linear .7s}.wind-east.wind-high .large.weather-2{animation:falling-2-east-high 2.2s infinite linear .7s}.wind-west .large.weather-2{animation:falling-2-west 2.2s infinite linear .7s}.wind-west.wind-med .large.weather-2{animation:falling-2-west-med 2.2s infinite linear .7s}.wind-west.wind-high .large.weather-2{animation:falling-2-west-high 2.2s infinite linear .7s}.large.weather-3{animation:falling-3 2s infinite linear 1.2s}.wind-east .large.weather-3{animation:falling-3-east 2s infinite linear 1.2s}.wind-east.wind-med .large.weather-3{animation:falling-3-east-med 2s infinite linear 1.2s}.wind-east.wind-high .large.weather-3{animation:falling-3-east-high 2s infinite linear 1.2s}.wind-west .large.weather-3{animation:falling-3-west 2s infinite linear 1.2s}.wind-west.wind-med .large.weather-3{animation:falling-3-west-med 2s infinite linear 1.2s}.wind-west.wind-high .large.weather-3{animation:falling-3-west-high 2s infinite linear 1.2s}.large.weather-4{animation:falling-4 2s infinite linear 1.2s}.wind-east .large.weather-4{animation:falling-4-east 2s infinite linear 1.2s}.wind-east.wind-med .large.weather-4{animation:falling-4-east-med 2s infinite linear 1.2s}.wind-east.wind-high .large.weather-4{animation:falling-4-east-high 2s infinite linear 1.2s}.wind-west .large.weather-4{animation:falling-4-west 2s infinite linear 1.2s}.wind-west.wind-med .large.weather-4{animation:falling-4-west-med 2s infinite linear 1.2s}.wind-west.wind-high .large.weather-4{animation:falling-4-west-high 2s infinite linear 1.2s}.large.weather-5{animation:falling-5 1.1s infinite linear .3s}.wind-east .large.weather-5{animation:falling-5-east 1.1s infinite linear .3s}.wind-east.wind-med .large.weather-5{animation:falling-5-east-med 1.1s infinite linear .3s}.wind-east.wind-high .large.weather-5{animation:falling-5-east-high 1.1s infinite linear .3s}.wind-west .large.weather-5{animation:falling-5-west 1.1s infinite linear .3s}.wind-west.wind-med .large.weather-5{animation:falling-5-west-med 1.1s infinite linear .3s}.wind-west.wind-high .large.weather-5{animation:falling-5-west-high 1.1s infinite linear .3s}.large.weather-6{animation:falling-6 1.7s infinite linear .3s}.wind-east .large.weather-6{animation:falling-6-east 1.7s infinite linear .3s}.wind-east.wind-med .large.weather-6{animation:falling-6-east-med 1.7s infinite linear .3s}.wind-east.wind-high .large.weather-6{animation:falling-6-east-high 1.7s infinite linear .3s}.wind-west .large.weather-6{animation:falling-6-west 1.7s infinite linear .3s}.wind-west.wind-med .large.weather-6{animation:falling-6-west-med 1.7s infinite linear .3s}.wind-west.wind-high .large.weather-6{animation:falling-6-west-high 1.7s infinite linear .3s}.large.weather-7{animation:falling-7 2.4s infinite linear .7s}.wind-east .large.weather-7{animation:falling-7-east 2.4s infinite linear .7s}.wind-east.wind-med .large.weather-7{animation:falling-7-east-med 2.4s infinite linear .7s}.wind-east.wind-high .large.weather-7{animation:falling-7-east-high 2.4s infinite linear .7s}.wind-west .large.weather-7{animation:falling-7-west 2.4s infinite linear .7s}.wind-west.wind-med .large.weather-7{animation:falling-7-west-med 2.4s infinite linear .7s}.wind-west.wind-high .large.weather-7{animation:falling-7-west-high 2.4s infinite linear .7s}.large.weather-8{animation:falling-8 2.3s infinite linear 1.1s}.wind-east .large.weather-8{animation:falling-8-east 2.3s infinite linear 1.1s}.wind-east.wind-med .large.weather-8{animation:falling-8-east-med 2.3s infinite linear 1.1s}.wind-east.wind-high .large.weather-8{animation:falling-8-east-high 2.3s infinite linear 1.1s}.wind-west .large.weather-8{animation:falling-8-west 2.3s infinite linear 1.1s}.wind-west.wind-med .large.weather-8{animation:falling-8-west-med 2.3s infinite linear 1.1s}.wind-west.wind-high .large.weather-8{animation:falling-8-west-high 2.3s infinite linear 1.1s}.large.weather-9{animation:falling-9 1.1s infinite linear 1.3s}.wind-east .large.weather-9{animation:falling-9-east 1.1s infinite linear 1.3s}.wind-east.wind-med .large.weather-9{animation:falling-9-east-med 1.1s infinite linear 1.3s}.wind-east.wind-high .large.weather-9{animation:falling-9-east-high 1.1s infinite linear 1.3s}.wind-west .large.weather-9{animation:falling-9-west 1.1s infinite linear 1.3s}.wind-west.wind-med .large.weather-9{animation:falling-9-west-med 1.1s infinite linear 1.3s}.wind-west.wind-high .large.weather-9{animation:falling-9-west-high 1.1s infinite linear 1.3s}.large.weather-10{animation:falling-10 2.5s infinite linear .4s}.wind-east .large.weather-10{animation:falling-10-east 2.5s infinite linear .4s}.wind-east.wind-med .large.weather-10{animation:falling-10-east-med 2.5s infinite linear .4s}.wind-east.wind-high .large.weather-10{animation:falling-10-east-high 2.5s infinite linear .4s}.wind-west .large.weather-10{animation:falling-10-west 2.5s infinite linear .4s}.wind-west.wind-med .large.weather-10{animation:falling-10-west-med 2.5s infinite linear .4s}.wind-west.wind-high .large.weather-10{animation:falling-10-west-high 2.5s infinite linear .4s}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],23:[function(require,module,exports){
var css = ".isFalling .weather{z-index:3;position:absolute;top:-10px;opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 2.7s infinite linear .2s}.wind-east .tiny.weather-1{animation:falling-1-east 2.7s infinite linear .2s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 2.7s infinite linear .2s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 2.7s infinite linear .2s}.wind-west .tiny.weather-1{animation:falling-1-west 2.7s infinite linear .2s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 2.7s infinite linear .2s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 2.7s infinite linear .2s}.tiny.weather-2{animation:falling-2 1.1s infinite linear 1.2s}.wind-east .tiny.weather-2{animation:falling-2-east 1.1s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 1.1s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 1.1s infinite linear 1.2s}.wind-west .tiny.weather-2{animation:falling-2-west 1.1s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 1.1s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 1.1s infinite linear 1.2s}.tiny.weather-3{animation:falling-3 2.2s infinite linear 1.2s}.wind-east .tiny.weather-3{animation:falling-3-east 2.2s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 2.2s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 2.2s infinite linear 1.2s}.wind-west .tiny.weather-3{animation:falling-3-west 2.2s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 2.2s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 2.2s infinite linear 1.2s}.tiny.weather-4{animation:falling-4 2.1s infinite linear .3s}.wind-east .tiny.weather-4{animation:falling-4-east 2.1s infinite linear .3s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 2.1s infinite linear .3s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 2.1s infinite linear .3s}.wind-west .tiny.weather-4{animation:falling-4-west 2.1s infinite linear .3s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 2.1s infinite linear .3s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 2.1s infinite linear .3s}.tiny.weather-5{animation:falling-5 3s infinite linear .7s}.wind-east .tiny.weather-5{animation:falling-5-east 3s infinite linear .7s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 3s infinite linear .7s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 3s infinite linear .7s}.wind-west .tiny.weather-5{animation:falling-5-west 3s infinite linear .7s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 3s infinite linear .7s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 3s infinite linear .7s}.tiny.weather-6{animation:falling-6 1.5s infinite linear .3s}.wind-east .tiny.weather-6{animation:falling-6-east 1.5s infinite linear .3s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 1.5s infinite linear .3s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 1.5s infinite linear .3s}.wind-west .tiny.weather-6{animation:falling-6-west 1.5s infinite linear .3s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 1.5s infinite linear .3s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 1.5s infinite linear .3s}.tiny.weather-7{animation:falling-7 1.6s infinite linear .6s}.wind-east .tiny.weather-7{animation:falling-7-east 1.6s infinite linear .6s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 1.6s infinite linear .6s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 1.6s infinite linear .6s}.wind-west .tiny.weather-7{animation:falling-7-west 1.6s infinite linear .6s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 1.6s infinite linear .6s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 1.6s infinite linear .6s}.tiny.weather-8{animation:falling-8 2s infinite linear .1s}.wind-east .tiny.weather-8{animation:falling-8-east 2s infinite linear .1s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 2s infinite linear .1s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 2s infinite linear .1s}.wind-west .tiny.weather-8{animation:falling-8-west 2s infinite linear .1s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 2s infinite linear .1s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 2s infinite linear .1s}.tiny.weather-9{animation:falling-9 1.8s infinite linear .8s}.wind-east .tiny.weather-9{animation:falling-9-east 1.8s infinite linear .8s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 1.8s infinite linear .8s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 1.8s infinite linear .8s}.wind-west .tiny.weather-9{animation:falling-9-west 1.8s infinite linear .8s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 1.8s infinite linear .8s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 1.8s infinite linear .8s}.tiny.weather-10{animation:falling-10 2.2s infinite linear 1.1s}.wind-east .tiny.weather-10{animation:falling-10-east 2.2s infinite linear 1.1s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 2.2s infinite linear 1.1s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 2.2s infinite linear 1.1s}.wind-west .tiny.weather-10{animation:falling-10-west 2.2s infinite linear 1.1s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 2.2s infinite linear 1.1s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 2.2s infinite linear 1.1s}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],24:[function(require,module,exports){
var css = ".isFalling .weather{z-index:3;position:absolute;top:-10px;opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 2.3s infinite linear .8s}.wind-east .tiny.weather-1{animation:falling-1-east 2.3s infinite linear .8s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 2.3s infinite linear .8s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 2.3s infinite linear .8s}.wind-west .tiny.weather-1{animation:falling-1-west 2.3s infinite linear .8s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 2.3s infinite linear .8s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 2.3s infinite linear .8s}.tiny.weather-2{animation:falling-2 2.7s infinite linear .6s}.wind-east .tiny.weather-2{animation:falling-2-east 2.7s infinite linear .6s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 2.7s infinite linear .6s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 2.7s infinite linear .6s}.wind-west .tiny.weather-2{animation:falling-2-west 2.7s infinite linear .6s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 2.7s infinite linear .6s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 2.7s infinite linear .6s}.tiny.weather-3{animation:falling-3 1.4s infinite linear 1.5s}.wind-east .tiny.weather-3{animation:falling-3-east 1.4s infinite linear 1.5s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 1.4s infinite linear 1.5s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 1.4s infinite linear 1.5s}.wind-west .tiny.weather-3{animation:falling-3-west 1.4s infinite linear 1.5s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 1.4s infinite linear 1.5s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 1.4s infinite linear 1.5s}.tiny.weather-4{animation:falling-4 1.4s infinite linear .7s}.wind-east .tiny.weather-4{animation:falling-4-east 1.4s infinite linear .7s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 1.4s infinite linear .7s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 1.4s infinite linear .7s}.wind-west .tiny.weather-4{animation:falling-4-west 1.4s infinite linear .7s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 1.4s infinite linear .7s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 1.4s infinite linear .7s}.tiny.weather-5{animation:falling-5 1.8s infinite linear 1.2s}.wind-east .tiny.weather-5{animation:falling-5-east 1.8s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 1.8s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 1.8s infinite linear 1.2s}.wind-west .tiny.weather-5{animation:falling-5-west 1.8s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 1.8s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 1.8s infinite linear 1.2s}.tiny.weather-6{animation:falling-6 1.2s infinite linear 1.2s}.wind-east .tiny.weather-6{animation:falling-6-east 1.2s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 1.2s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 1.2s infinite linear 1.2s}.wind-west .tiny.weather-6{animation:falling-6-west 1.2s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 1.2s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 1.2s infinite linear 1.2s}.tiny.weather-7{animation:falling-7 1.5s infinite linear .9s}.wind-east .tiny.weather-7{animation:falling-7-east 1.5s infinite linear .9s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 1.5s infinite linear .9s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 1.5s infinite linear .9s}.wind-west .tiny.weather-7{animation:falling-7-west 1.5s infinite linear .9s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 1.5s infinite linear .9s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 1.5s infinite linear .9s}.tiny.weather-8{animation:falling-8 1.8s infinite linear .7s}.wind-east .tiny.weather-8{animation:falling-8-east 1.8s infinite linear .7s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 1.8s infinite linear .7s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 1.8s infinite linear .7s}.wind-west .tiny.weather-8{animation:falling-8-west 1.8s infinite linear .7s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 1.8s infinite linear .7s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 1.8s infinite linear .7s}.tiny.weather-9{animation:falling-9 2.1s infinite linear .5s}.wind-east .tiny.weather-9{animation:falling-9-east 2.1s infinite linear .5s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 2.1s infinite linear .5s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 2.1s infinite linear .5s}.wind-west .tiny.weather-9{animation:falling-9-west 2.1s infinite linear .5s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 2.1s infinite linear .5s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 2.1s infinite linear .5s}.tiny.weather-10{animation:falling-10 2.1s infinite linear .8s}.wind-east .tiny.weather-10{animation:falling-10-east 2.1s infinite linear .8s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 2.1s infinite linear .8s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 2.1s infinite linear .8s}.wind-west .tiny.weather-10{animation:falling-10-west 2.1s infinite linear .8s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 2.1s infinite linear .8s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 2.1s infinite linear .8s}.small.weather{height:26px;width:13px;background:rgba(100,130,255,0.75)}.small.weather-1{animation:falling-1 1.4s infinite linear 1.3s}.wind-east .small.weather-1{animation:falling-1-east 1.4s infinite linear 1.3s}.wind-east.wind-med .small.weather-1{animation:falling-1-east-med 1.4s infinite linear 1.3s}.wind-east.wind-high .small.weather-1{animation:falling-1-east-high 1.4s infinite linear 1.3s}.wind-west .small.weather-1{animation:falling-1-west 1.4s infinite linear 1.3s}.wind-west.wind-med .small.weather-1{animation:falling-1-west-med 1.4s infinite linear 1.3s}.wind-west.wind-high .small.weather-1{animation:falling-1-west-high 1.4s infinite linear 1.3s}.small.weather-2{animation:falling-2 2.6s infinite linear 1.3s}.wind-east .small.weather-2{animation:falling-2-east 2.6s infinite linear 1.3s}.wind-east.wind-med .small.weather-2{animation:falling-2-east-med 2.6s infinite linear 1.3s}.wind-east.wind-high .small.weather-2{animation:falling-2-east-high 2.6s infinite linear 1.3s}.wind-west .small.weather-2{animation:falling-2-west 2.6s infinite linear 1.3s}.wind-west.wind-med .small.weather-2{animation:falling-2-west-med 2.6s infinite linear 1.3s}.wind-west.wind-high .small.weather-2{animation:falling-2-west-high 2.6s infinite linear 1.3s}.small.weather-3{animation:falling-3 1.9s infinite linear .1s}.wind-east .small.weather-3{animation:falling-3-east 1.9s infinite linear .1s}.wind-east.wind-med .small.weather-3{animation:falling-3-east-med 1.9s infinite linear .1s}.wind-east.wind-high .small.weather-3{animation:falling-3-east-high 1.9s infinite linear .1s}.wind-west .small.weather-3{animation:falling-3-west 1.9s infinite linear .1s}.wind-west.wind-med .small.weather-3{animation:falling-3-west-med 1.9s infinite linear .1s}.wind-west.wind-high .small.weather-3{animation:falling-3-west-high 1.9s infinite linear .1s}.small.weather-4{animation:falling-4 1.1s infinite linear .2s}.wind-east .small.weather-4{animation:falling-4-east 1.1s infinite linear .2s}.wind-east.wind-med .small.weather-4{animation:falling-4-east-med 1.1s infinite linear .2s}.wind-east.wind-high .small.weather-4{animation:falling-4-east-high 1.1s infinite linear .2s}.wind-west .small.weather-4{animation:falling-4-west 1.1s infinite linear .2s}.wind-west.wind-med .small.weather-4{animation:falling-4-west-med 1.1s infinite linear .2s}.wind-west.wind-high .small.weather-4{animation:falling-4-west-high 1.1s infinite linear .2s}.small.weather-5{animation:falling-5 2.5s infinite linear .6s}.wind-east .small.weather-5{animation:falling-5-east 2.5s infinite linear .6s}.wind-east.wind-med .small.weather-5{animation:falling-5-east-med 2.5s infinite linear .6s}.wind-east.wind-high .small.weather-5{animation:falling-5-east-high 2.5s infinite linear .6s}.wind-west .small.weather-5{animation:falling-5-west 2.5s infinite linear .6s}.wind-west.wind-med .small.weather-5{animation:falling-5-west-med 2.5s infinite linear .6s}.wind-west.wind-high .small.weather-5{animation:falling-5-west-high 2.5s infinite linear .6s}.small.weather-6{animation:falling-6 2.4s infinite linear 1.2s}.wind-east .small.weather-6{animation:falling-6-east 2.4s infinite linear 1.2s}.wind-east.wind-med .small.weather-6{animation:falling-6-east-med 2.4s infinite linear 1.2s}.wind-east.wind-high .small.weather-6{animation:falling-6-east-high 2.4s infinite linear 1.2s}.wind-west .small.weather-6{animation:falling-6-west 2.4s infinite linear 1.2s}.wind-west.wind-med .small.weather-6{animation:falling-6-west-med 2.4s infinite linear 1.2s}.wind-west.wind-high .small.weather-6{animation:falling-6-west-high 2.4s infinite linear 1.2s}.small.weather-7{animation:falling-7 1.2s infinite linear 1.5s}.wind-east .small.weather-7{animation:falling-7-east 1.2s infinite linear 1.5s}.wind-east.wind-med .small.weather-7{animation:falling-7-east-med 1.2s infinite linear 1.5s}.wind-east.wind-high .small.weather-7{animation:falling-7-east-high 1.2s infinite linear 1.5s}.wind-west .small.weather-7{animation:falling-7-west 1.2s infinite linear 1.5s}.wind-west.wind-med .small.weather-7{animation:falling-7-west-med 1.2s infinite linear 1.5s}.wind-west.wind-high .small.weather-7{animation:falling-7-west-high 1.2s infinite linear 1.5s}.small.weather-8{animation:falling-8 1.5s infinite linear .5s}.wind-east .small.weather-8{animation:falling-8-east 1.5s infinite linear .5s}.wind-east.wind-med .small.weather-8{animation:falling-8-east-med 1.5s infinite linear .5s}.wind-east.wind-high .small.weather-8{animation:falling-8-east-high 1.5s infinite linear .5s}.wind-west .small.weather-8{animation:falling-8-west 1.5s infinite linear .5s}.wind-west.wind-med .small.weather-8{animation:falling-8-west-med 1.5s infinite linear .5s}.wind-west.wind-high .small.weather-8{animation:falling-8-west-high 1.5s infinite linear .5s}.small.weather-9{animation:falling-9 2.3s infinite linear .4s}.wind-east .small.weather-9{animation:falling-9-east 2.3s infinite linear .4s}.wind-east.wind-med .small.weather-9{animation:falling-9-east-med 2.3s infinite linear .4s}.wind-east.wind-high .small.weather-9{animation:falling-9-east-high 2.3s infinite linear .4s}.wind-west .small.weather-9{animation:falling-9-west 2.3s infinite linear .4s}.wind-west.wind-med .small.weather-9{animation:falling-9-west-med 2.3s infinite linear .4s}.wind-west.wind-high .small.weather-9{animation:falling-9-west-high 2.3s infinite linear .4s}.small.weather-10{animation:falling-10 1.1s infinite linear 1.3s}.wind-east .small.weather-10{animation:falling-10-east 1.1s infinite linear 1.3s}.wind-east.wind-med .small.weather-10{animation:falling-10-east-med 1.1s infinite linear 1.3s}.wind-east.wind-high .small.weather-10{animation:falling-10-east-high 1.1s infinite linear 1.3s}.wind-west .small.weather-10{animation:falling-10-west 1.1s infinite linear 1.3s}.wind-west.wind-med .small.weather-10{animation:falling-10-west-med 1.1s infinite linear 1.3s}.wind-west.wind-high .small.weather-10{animation:falling-10-west-high 1.1s infinite linear 1.3s}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],25:[function(require,module,exports){
var css = "#sun,#moon{position:absolute;top:var(--light-position);left:var(--light-position);height:var(--light-size);width:var(--light-size);border-radius:50%}#weather:not(.night) #moon{top:calc(100% - var(--light-position));left:calc(100% - var(--light-position));height:calc(var(--light-size) / 2);width:calc(var(--light-size) / 2)}#sun{background:linear-gradient(#ff0, #fc0);box-shadow:0 0 10px orange}#moon{background:#334;box-shadow:0 0 10px #aaa;overflow:hidden;visibility:hidden}.light-overlay{position:absolute;z-index:2;top:-1px;left:-1px;height:calc(var(--light-size) + 2px);width:calc(var(--light-size) + 2px);border-radius:50%;background:rgba(235,235,255,0.8)}.empty.light-overlay{visibility:hidden}.half .light-overlay{border-radius:0}.right.half .light-overlay{left:calc(.5 * var(--light-size))}.left.half .light-overlay{left:calc(-.5 * var(--light-size))}.gibbous .light-overlay{height:calc(1.2 * var(--light-size));top:calc(-.1 * var(--light-size))}.gibbous.left .light-overlay{left:calc(-.25 * var(--light-size))}.gibbous.right .light-overlay{left:calc(.25 * var(--light-size))}.crescent .light-overlay{border-radius:0}.crescent .light-overlay:after{content:'';position:absolute;z-index:2;top:calc(-.1 * var(--light-size));height:calc(1.2 * var(--light-size));width:var(--light-size);border-radius:50%;background:rgba(50,50,70,0.8)}.crescent.right .light-overlay:after{left:calc(-.25 * var(--light-size))}.crescent.left .light-overlay:after{left:calc(.25 * var(--light-size))}.dots{position:relative;z-index:1;border-radius:50%;height:100%;width:100%}.dot{background:#001;position:absolute;height:5px;width:5px;border-radius:50%}.dot.one{height:7px;width:7px;top:10px;left:16px}.dot.two{top:40px;left:56px}.dot.three{top:20px;left:16px}.dot.four{height:7px;width:7px;top:50px;left:18px}.dot.five{height:7px;width:7px;top:50px;left:36px}.dot.six{height:10px;width:13px;top:23px;left:42px}.dot.seven{height:10px;width:10px;top:53px;left:20px}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],26:[function(require,module,exports){
var css = ".cloud:after,.puff:after{content:'';left:600px;visibility:visible}.wind-west .cloud:after,.wind-west .puff:after{left:-600px}.wind-low.wind-east .cloud,.wind-low.wind-east .puff{animation:eastWind 60s infinite linear}.wind-low.wind-east.mist .cloud,.wind-low.wind-east.mist .puff{animation:eastWindMist 60s infinite linear}.wind-low.wind-east.smoke .cloud,.wind-low.wind-east.smoke .puff{animation:eastWindSmoke 60s infinite linear}.wind-low.wind-west .cloud,.wind-low.wind-west .puff{animation:westWind 60s infinite linear}.wind-low.wind-west.mist .cloud,.wind-low.wind-west.mist .puff{animation:westWindMist 60s infinite linear}.wind-low.wind-west.smoke .cloud,.wind-low.wind-west.smoke .puff{animation:westWindSmoke 60s infinite linear}.wind-med.wind-east .cloud,.wind-med.wind-east .puff{animation:eastWind 40s infinite linear}.wind-med.wind-east.mist .cloud,.wind-med.wind-east.mist .puff{animation:eastWindMist 40s infinite linear}.wind-med.wind-east.smoke .cloud,.wind-med.wind-east.smoke .puff{animation:eastWindSmoke 40s infinite linear}.wind-med.wind-west .cloud,.wind-med.wind-west .puff{animation:westWind 40s infinite linear}.wind-med.wind-west.mist .cloud,.wind-med.wind-west.mist .puff{animation:westWindMist 40s infinite linear}.wind-med.wind-west.smoke .cloud,.wind-med.wind-west.smoke .puff{animation:westWindSmoke 40s infinite linear}.wind-high.wind-east .cloud,.wind-high.wind-east .puff{animation:eastWind 20s infinite linear}.wind-high.wind-east.mist .cloud,.wind-high.wind-east.mist .puff{animation:eastWindMist 20s infinite linear}.wind-high.wind-east.smoke .cloud,.wind-high.wind-east.smoke .puff{animation:eastWindSmoke 20s infinite linear}.wind-high.wind-west .cloud,.wind-high.wind-west .puff{animation:westWind 20s infinite linear}.wind-high.wind-west.mist .cloud,.wind-high.wind-west.mist .puff{animation:westWindMist 20s infinite linear}.wind-high.wind-west.smoke .cloud,.wind-high.wind-west.smoke .puff{animation:westWindSmoke 20s infinite linear}@keyframes eastWind{100%{transform:translateX(-600px)}}@keyframes westWind{100%{transform:translateX(600px)}}@keyframes eastWindMist{100%{transform:translateX(-600px) translateY(140px) scaleY(0.4)}}@keyframes westWindMist{100%{transform:translateX(600px) translateY(140px) scaleY(0.4)}}@keyframes eastWindSmoke{100%{transform:translateX(-600px) translateX(-80px) translateY(30px) scaleY(2.5)}}@keyframes westWindSmoke{100%{transform:translateX(600px) translateX(-80px) translateY(30px) scaleY(2.5)}}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],27:[function(require,module,exports){
const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function getCardinalWindDirection(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = getCardinalWindDirection;
},{}],28:[function(require,module,exports){
const weather = require('./weatherTypes');

function getWeatherClassName(weatherCode) {
    // return { baseWeatherType: 'thunder', weatherModifier: 'heavy' };

    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 801 || weatherCode == 771) return { baseWeatherType: weather.clouds, };
    if (weatherCode == 701 || weatherCode == 741) return { baseWeatherType: weather.mist, };
    if (weatherCode >= 711 && weatherCode <= 762) return { baseWeatherType: weather.smoke, };
    if (weatherCode == 800 || weatherCode > 762) return { baseWeatherType: weather.clear, };
    if (weatherCode >= 600) return { baseWeatherType: weather.snow, };
    if (weatherCode >= 500) return { baseWeatherType: weather.rain, weatherModifier: weather.severity.medium, }; // 500s rain incl light
    if (weatherCode >= 300) return { baseWeatherType: weather.rain, weatherModifier: weather.severity.light, }; // drizzle
    if (weatherCode >= 200) return { baseWeatherType: weather.lightning, weatherModifier: weather.severity.heavy };
    
    throw new Error('unrecognized weather code!');
}

module.exports = getWeatherClassName;
},{"./weatherTypes":29}],29:[function(require,module,exports){
let supportedWeather = {
    clear: 1,
    clouds: 2,
    lightning: 3,
    mist: 4,
    night: 5,
    rain: 6,
    smoke: 7,
    snow: 8,
    wind: 9,
}

let rainyTypes = [
    supportedWeather.rain,
    supportedWeather.snow,
    supportedWeather.lightning
]

let cloudyTypes = [
    supportedWeather.cloudyTypes,
    supportedWeather.mist,
    supportedWeather.smoke,
    supportedWeather.lightning
]

let severity = {
    light: 1,
    medium: 2,
    heavy: 3,
}

const weather = {
    ...supportedWeather,
    severity: severity,
    isRainy: t => rainyTypes.includes(t),
    isCloudy: t => cloudyTypes.includes(t),
}

module.exports = weather;
},{}]},{},[8]);
