;(function() {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = 'function' == typeof require && require
                    if (!f && c) return c(i, !0)
                    if (u) return u(i, !0)
                    var a = new Error("Cannot find module '" + i + "'")
                    throw ((a.code = 'MODULE_NOT_FOUND'), a)
                }
                var p = (n[i] = { exports: {} })
                e[i][0].call(
                    p.exports,
                    function(r) {
                        var n = e[i][1][r]
                        return o(n || r)
                    },
                    p,
                    p.exports,
                    r,
                    e,
                    n,
                    t
                )
            }
            return n[i].exports
        }
        for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i])
        return o
    }
    return r
})()(
    {
        1: [
            function(require, module, exports) {
                'use strict'
                /*eslint-env browser */

                module.exports = {
                    /**
                     * Create a <style>...</style> tag and add it to the document head
                     * @param {string} cssText
                     * @param {object?} options
                     * @return {Element}
                     */
                    createStyle: function(cssText, options) {
                        var container = document.head || document.getElementsByTagName('head')[0]
                        var style = document.createElement('style')
                        options = options || {}
                        style.type = 'text/css'
                        if (options.href) {
                            style.setAttribute('data-href', options.href)
                        }
                        if (style.sheet) {
                            // for jsdom and IE9+
                            style.innerHTML = cssText
                            style.sheet.cssText = cssText
                        } else if (style.styleSheet) {
                            // for IE8 and below
                            style.styleSheet.cssText = cssText
                        } else {
                            // for Chrome, Firefox, and Safari
                            style.appendChild(document.createTextNode(cssText))
                        }
                        if (options.prepend) {
                            container.insertBefore(style, container.childNodes[0])
                        } else {
                            container.appendChild(style)
                        }
                        return style
                    },
                }
            },
            {},
        ],
        2: [
            function(require, module, exports) {
                function subscribe(eventName, eventResponse, eventResponseLookupString) {
                    window.localStorage.setItem(eventResponseLookupString, eventResponse)
                    document.addEventListener(eventName, eventResponse)
                }

                function unsubscribe(eventName, eventResponseLookupString) {
                    const listenerToClear = window.localStorage.getItem(eventResponseLookupString)
                    document.removeEventListener(eventName, listenerToClear)
                    window.localStorage.removeItem(eventResponseLookupString)
                }

                module.exports = {
                    subscribe,
                    unsubscribe,
                }
            },
            {},
        ],
        3: [
            function(require, module, exports) {
                const logError = require('./utils/logError')
                const { subscribe, unsubscribe } = require('./DOMutils')

                function fetchJsonResource(URI, successCallback, failureCallback, isHealthyResponseCallback) {
                    let startTime = Date.now()
                    fetch(URI)
                        .then(res => handleResponse(res, failureCallback))
                        .then(blob =>
                            checkResponseBody(
                                blob,
                                isHealthyResponseCallback,
                                successCallback,
                                failureCallback,
                                startTime
                            )
                        )
                        .catch(err => handleFailure(err, failureCallback))
                }

                function handleResponse(apiResponse, failureCallback) {
                    if (!apiResponse.ok) return failureCallback()
                    return apiResponse.json()
                }

                function checkResponseBody(
                    apiResponseBlob,
                    isHealthyApiResponseCallback,
                    successCallback,
                    failureCallback,
                    startTime
                ) {
                    const next = () => {
                        return isHealthyApiResponseCallback(apiResponseBlob)
                            ? successCallback(apiResponseBlob, startTime)
                            : failureCallback()
                    }

                    if (document.readyState != 'loading') {
                        return next()
                    }

                    const subscribeId = getRandomIdentifier()
                    subscribe(
                        'DOMContentLoaded',
                        () => {
                            unsubscribeHandler(next, 'DOMContentLoaded', subscribeId)
                        },
                        subscribeId
                    )
                }

                function unsubscribeHandler(nextCallback, eventName, eventHandlerLookup) {
                    unsubscribe(eventName, eventHandlerLookup)
                    nextCallback()
                }

                function handleFailure(error, failureCallback) {
                    if (error) logError(error)
                    failureCallback()
                }

                function getRandomIdentifier() {
                    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
                    let array = new Uint32Array(2)
                    window.crypto.getRandomValues(array)
                    return array.join()
                }

                module.exports = fetchJsonResource
            },
            { './DOMutils': 2, './utils/logError': 7 },
        ],
        4: [
            function(require, module, exports) {
                function getCustomParams() {
                    const urlParams = getUrlParams()
                    if (urlParams) {
                        let zip = getZipIfPresent(urlParams)
                        zip = zip == undefined ? '98108' : zip

                        let units = getUnitsIfPresent(urlParams)
                        units = units == 'metric' ? 'metric' : 'imperial'

                        let country = getCountryIfPresent(urlParams)
                        country = country ? country : 'us'

                        return {
                            zip: zip,
                            units: units,
                            country: country,
                        }
                    }
                }

                function getUrlParams() {
                    let urlParts = window.location.href.split('?')
                    if (urlParts.length > 1) {
                        urlParts = urlParts[1].split('&')

                        if (urlParts.length > 0) {
                            let params = {}

                            urlParts.forEach(unit => {
                                keyValues = unit.split('=') // eg, zip=98116
                                params[keyValues[0]] = keyValues[1] // eg params.zip = 98116
                            })

                            return params
                        }
                    }
                }

                function getZipIfPresent(params) {
                    if (params.zip) {
                        return params.zip
                    }
                }

                function getUnitsIfPresent(params) {
                    if (params.units) {
                        if (params.units == 'metric' || params.units == 'imperial') {
                            return params.units
                        }
                    }
                }

                function getCountryIfPresent(params) {
                    if (params.country) {
                        return params.country
                    }
                }

                module.exports = getCustomParams
            },
            {},
        ],
        5: [
            function(require, module, exports) {
                const addMoonToDOM = require('../view/addMoonToDOM')
                const { MOON_ENDPOINT, REPLACE, FALLBACK_MOON, getMoonUrl } = require('./weatherAPIs')
                const fetchJsonResource = require('./fetchJsonResource')

                function getDateParam(date) {
                    const year = date.getUTCFullYear().toString()
                    const month = (date.getUTCMonth() + 1).toString() // js 0 index month
                    const day = date.getUTCDate().toString()

                    let param = year.toString()
                    if (month.length < 2) param += '0'
                    param += month
                    if (day.length < 2) param += '0'
                    param += day

                    return param
                }

                let moonURI = MOON_ENDPOINT

                function loadMoon() {
                    if (window.custom_location) {
                        if (window.location_saved) {
                            moonURI = getMoonUrl(window.latitude, window.longitude)
                            actuallyLoadMoon()
                        } else {
                            setTimeout(loadMoon, 100)
                        }
                    } else {
                        actuallyLoadMoon()
                    }
                }

                function actuallyLoadMoon() {
                    const date = getDateParam(new Date(Date.now()))
                    fetchJsonResource(
                        moonURI.replace(REPLACE, date),
                        addMoonToDOM,
                        useFallbackMoon,
                        isSuccessfulReponseBody
                    )
                }

                function isSuccessfulReponseBody(blob) {
                    return blob && blob.moonPhase
                }

                function useFallbackMoon() {
                    return addMoonToDOM(FALLBACK_MOON)
                }

                module.exports = loadMoon
            },
            { '../view/addMoonToDOM': 11, './fetchJsonResource': 3, './weatherAPIs': 8 },
        ],
        6: [
            function(require, module, exports) {
                const addWeatherToDOM = require('../view/addWeatherToDOM')
                const { WEATHER_ENDPOINT, FALLBACK_WEATHER, getWeatherUrl } = require('./weatherAPIs')
                const fetchJsonResource = require('./fetchJsonResource')
                const getCustomParams = require('./getCustomParams')

                let weatherURI = WEATHER_ENDPOINT

                function handleUrlOverrides() {
                    const customParams = getCustomParams()

                    if (customParams) {
                        weatherURI = getWeatherUrl(customParams.zip, customParams.units, customParams.country)
                        window.custom_location = true
                        window.is_metric = customParams.units == 'metric'
                    }
                }

                function loadWeather() {
                    handleUrlOverrides()

                    fetchJsonResource(weatherURI, addWeatherToDOM, useFallbackWeather, isSuccessfulReponseBody)
                }

                function isSuccessfulReponseBody(blob) {
                    return blob.cod && blob.cod == 200
                }

                function useFallbackWeather() {
                    return addWeatherToDOM(FALLBACK_WEATHER)
                }

                module.exports = loadWeather
            },
            { '../view/addWeatherToDOM': 14, './fetchJsonResource': 3, './getCustomParams': 4, './weatherAPIs': 8 },
        ],
        7: [
            function(require, module, exports) {
                function logError(error) {
                    console.error(error.message)
                }

                module.exports = logError
            },
            {},
        ],
        8: [
            function(require, module, exports) {
                const SEATTLE_LAT = '47.5922116'
                const SEATTLE_LONG = '-122.3205388'

                // https://openweathermap.org/current
                const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d`
                const FALLBACK_WEATHER = {
                    weather: [{ id: 601 }],
                    wind: { speed: 25, deg: 90 },
                    main: {
                        humidity: 84,
                        temp: 52,
                        temp_min: 39,
                        temp_max: 61,
                    },
                    sys: { sunrise: 1, sunset: 3 },
                    dt: 4,
                }

                function getWeatherUrl(zip, units, country) {
                    return `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&units=${units}&appid=231512774f62e8fcb7d1a19af041b94d`
                }

                // https://solunar.org/#usage
                const REPLACE = '@@REPLACE@@'
                const MOON_ENDPOINT = `https://api.solunar.org/solunar/${SEATTLE_LAT},${SEATTLE_LONG},${REPLACE},-7`
                const FALLBACK_MOON = {
                    moonPhase: 'Waning Gibbous',
                    moonRise: '01:04',
                    moonSet: '16:53',
                }

                function getMoonUrl(lat, long) {
                    return `https://api.solunar.org/solunar/${lat},${long},${REPLACE},-7`
                }

                module.exports = {
                    WEATHER_ENDPOINT,
                    FALLBACK_WEATHER,
                    REPLACE,
                    MOON_ENDPOINT,
                    FALLBACK_MOON,
                    getWeatherUrl,
                    getMoonUrl,
                }
            },
            {},
        ],
        9: [
            function(require, module, exports) {
                require('./view/styles/index.scss')
                const loadWeather = require('./data/loadWeather')
                const loadMoon = require('./data/loadMoon')

                // handle custom locations

                loadWeather()
                loadMoon()
            },
            { './data/loadMoon': 5, './data/loadWeather': 6, './view/styles/index.scss': 20 },
        ],
        10: [
            function(require, module, exports) {
                const addClass = require('./utils/addClass')
                const weather = require('./utils/weatherTypes')

                function addCloudLikeWeather(weatherElement, weatherType, severity) {
                    addClass(weatherElement, 'clouds')

                    switch (weatherType) {
                        case weather.mist:
                            require('./styles/cloud-like-weather/mist.scss')
                            break
                        case weather.smoke:
                            require('./styles/cloud-like-weather/smoke.scss')
                            break
                        case weather.storm:
                            require('./styles/cloud-like-weather/storm.scss')
                        case weather.clouds:
                        default:
                            require('./styles/cloud-like-weather/clouds.scss')
                            if (severity == weather.severity.light) addClass(weatherElement, 'light')
                            if (severity == weather.severity.heavy) addClass(weatherElement, 'heavy')
                            break
                    }
                }

                module.exports = addCloudLikeWeather
            },
            {
                './styles/cloud-like-weather/clouds.scss': 16,
                './styles/cloud-like-weather/mist.scss': 17,
                './styles/cloud-like-weather/smoke.scss': 18,
                './styles/cloud-like-weather/storm.scss': 19,
                './utils/addClass': 28,
                './utils/weatherTypes': 33,
            },
        ],
        11: [
            function(require, module, exports) {
                const addClass = require('./utils/addClass')
                const reportModuleLoaded = require('./utils/reportModuleLoaded')

                const convertStringNumberToNumber = sn => Number(sn)

                // FIXME: this logic may be broken. verify API returns always: current moon rise & set always in that order
                //        (eg, never previously set at 04:30 and back up at 21:00 when current time is 16:00 same day)
                function isMoonVisible(moonRiseTime, moonSetTime) {
                    let time = new Date(Date.now())
                    let currentHour = time.getUTCHours() - 7
                    if (currentHour < 1) currentHour += 24
                    const currentMin = time.getUTCMinutes()

                    let [riseHour, riseMin] = moonRiseTime.split(':').map(convertStringNumberToNumber)
                    let [setHour, setMin] = moonSetTime.split(':').map(convertStringNumberToNumber)

                    if (currentHour < riseHour) currentHour += 24
                    if (setHour < riseHour) setHour += 24

                    if (riseHour < currentHour && currentHour < setHour) return true
                    if (riseHour == currentHour && riseMin <= currentMin) return true
                    if (setHour == currentHour && currentMin <= setMin) return true

                    return false
                }

                const phases = {
                    new: { shapeClass: 'new' },
                    waxingCrescent: { shapeClass: 'crescent', lightStartClass: 'right' },
                    firstQuarter: { shapeClass: 'half', lightStartClass: 'right' },
                    waxingGibbous: { shapeClass: 'gibbous', lightStartClass: 'right' },
                    full: { shapeClass: 'full' },
                    waningGibbous: { shapeClass: 'gibbous', lightStartClass: 'left' },
                    thirdQuarter: { shapeClass: 'half', lightStartClass: 'left' },
                    waningCrescent: { shapeClass: 'crescent', lightStartClass: 'left' },
                }

                function getPhase(blob) {
                    switch (blob.moonPhase) {
                        case 'Waxing Crescent':
                            return blob.moonIllumination < 0.1 ? phases.new : phases.waxingCrescent
                        case 'First Quarter':
                            return blob.moonIllumination < 0.35 ? phases.waxingCrescent : phases.firstQuarter
                        case 'Waxing Gibbous':
                            return blob.moonIllumination < 0.6 ? phases.firstQuarter : phases.waxingGibbous
                        case 'Full Moon':
                            return blob.moonIllumination < 0.85 ? phases.waxingGibbous : phases.full
                        case 'Waning Gibbous':
                            return blob.moonIllumination > 0.9 ? phases.full : phases.waningGibbous
                        case 'Third Quarter':
                            return blob.moonIllumination > 0.65 ? phases.waningGibbous : phases.thirdQuarter
                        case 'Waning Crescent':
                            return blob.moonIllumination > 0.4 ? phases.thirdQuarter : phases.waningCrescent
                        case 'New Moon':
                            return blob.moonIllumination > 0.15 ? phases.waningCrescent : phases.new
                        default:
                            throw new Error('unrecognized moon phase')
                    }
                }

                function addMoonToDOM(moonBlob) {
                    if (isMoonVisible(moonBlob.moonRise, moonBlob.moonSet)) {
                        let moonElement = document.getElementById('moon')
                        addClass(moonElement, 'visible')

                        let { shapeClass, lightStartClass } = getPhase(moonBlob)
                        addClass(moonElement, shapeClass)
                        if (lightStartClass) addClass(moonElement, lightStartClass)
                    }

                    reportModuleLoaded('moon')
                }

                module.exports = addMoonToDOM
            },
            { './utils/addClass': 28, './utils/reportModuleLoaded': 32 },
        ],
        12: [
            function(require, module, exports) {
                const addClass = require('./utils/addClass')
                const weather = require('./utils/weatherTypes')

                function addRainToDOM(weatherElement, baseWeatherType, rainLevel) {
                    addClass(weatherElement, 'isFalling')

                    if (baseWeatherType == weather.snow) {
                        require('./styles/rain-like-weather/snowFalling.scss')
                        return // no need to add rain
                    }

                    switch (rainLevel) {
                        case weather.severity.medium:
                            require('./styles/rain-like-weather/mediumFalling.scss')
                            break
                        case weather.severity.heavy:
                            require('./styles/rain-like-weather/heavyFalling.scss')
                            break
                        case weather.severity.light:
                        default:
                            require('./styles/rain-like-weather/lightFalling.scss')
                            break
                    }
                }

                module.exports = addRainToDOM
            },
            {
                './styles/rain-like-weather/heavyFalling.scss': 22,
                './styles/rain-like-weather/lightFalling.scss': 23,
                './styles/rain-like-weather/mediumFalling.scss': 24,
                './styles/rain-like-weather/snowFalling.scss': 25,
                './utils/addClass': 28,
                './utils/weatherTypes': 33,
            },
        ],
        13: [
            function(require, module, exports) {
                function addWeatherDataToDOM(blob) {
                    const humidity = blob.humidity
                    const temp = blob.temp
                    const minTemp = blob.temp_min
                    const maxTemp = blob.temp_max

                    document.getElementById('humidity').innerHTML = humidity
                    document.getElementById('temp').innerHTML = temp

                    // these properties are not guaranteed to be always returned by the API
                    if (minTemp && maxTemp) {
                        document.getElementById('temp-min').innerHTML = minTemp
                        document.getElementById('temp-max').innerHTML = maxTemp
                    } else {
                        document.getElementById('min-max').classList.add('hidden')
                    }

                    // handle units URL override (?units=metric)
                    if (window.is_metric) {
                        document.getElementById('units').innerHTML = 'C'
                    }
                }

                module.exports = addWeatherDataToDOM
            },
            {},
        ],
        14: [
            function(require, module, exports) {
                const addClass = require('./utils/addClass')
                const addCloudsToDOM = require('./addCloudsToDOM')
                const addRainToDOM = require('./addRainToDOM')
                const addWeatherDataToDOM = require('./addWeatherDataToDOM')
                const addWindToDOM = require('./addWindToDOM')
                const getWeatherClassName = require('./utils/getWeatherClassName')
                const isGreatWheelOpen = require('./utils/isGreatWheelOpen')
                const weather = require('./utils/weatherTypes')
                const reportModuleLoaded = require('./utils/reportModuleLoaded')

                function addWeatherToDOM(blob, fetchStartTime) {
                    handleCustomLocations(blob)

                    let weatherElement = document.getElementById('weather')
                    require('./styles/sun-and-moon.scss')

                    if (isGreatWheelOpen(blob.dt, blob.timezone)) {
                        addClass(weatherElement, 'greatWheelOpen')
                    }

                    let { baseWeatherType, weatherModifier } = getWeatherClassName(blob.weather[0].id)

                    addClass(weatherElement, baseWeatherType)

                    let isWindSupported = false
                    if (weather.isCloudy(baseWeatherType)) {
                        addCloudsToDOM(weatherElement, baseWeatherType, weatherModifier)
                        isWindSupported = true // wind animation is currently only supported for cloud-like weathers
                    }

                    addWindToDOM(weatherElement, blob.wind, !isWindSupported)

                    if (weather.isRainy(baseWeatherType)) {
                        addRainToDOM(weatherElement, baseWeatherType, weatherModifier)
                    }

                    const isNight = blob.dt < blob.sys.sunrise || blob.dt > blob.sys.sunset
                    if (isNight) {
                        addClass(weatherElement, 'night')
                        require('./styles/night.scss')
                    }

                    addWeatherDataToDOM(blob.main)

                    reportModuleLoaded('weather')
                }

                /**
                 * extra handling for custom locations (via URL override).
                 * the moon API request needs lat/long values, which aren't
                 * available until the weather API returns them.
                 */

                function handleCustomLocations(blob) {
                    if (window.custom_location) {
                        window.latitude = blob.coord.lat
                        window.longitude = blob.coord.lon
                        window.location_saved = true
                    }
                }

                module.exports = addWeatherToDOM
            },
            {
                './addCloudsToDOM': 10,
                './addRainToDOM': 12,
                './addWeatherDataToDOM': 13,
                './addWindToDOM': 15,
                './styles/night.scss': 21,
                './styles/sun-and-moon.scss': 26,
                './utils/addClass': 28,
                './utils/getWeatherClassName': 30,
                './utils/isGreatWheelOpen': 31,
                './utils/reportModuleLoaded': 32,
                './utils/weatherTypes': 33,
            },
        ],
        15: [
            function(require, module, exports) {
                const addClass = require('./utils/addClass')
                const getCardinalWindDirection = require('./utils/getCardinalWindDirection')

                function addWindSpeed(weatherElement, speed, noAnimations) {
                    document.getElementById('wind-speed').innerHTML = speed
                    if (noAnimations) return

                    // TODO: styles-- add sideways falling objects if windSpeed > 30 (extreme)?
                    if (speed > 20) {
                        addClass(weatherElement, 'wind-high')
                    } else if (speed > 10) {
                        addClass(weatherElement, 'wind-med')
                    } else if (speed > 0) {
                        addClass(weatherElement, 'wind-low')
                    }
                }

                function addWindDirection(weatherElement, windDegrees, noAnimations) {
                    let direction = getCardinalWindDirection(windDegrees)
                    document.getElementById('wind-direction').innerHTML = direction
                    if (noAnimations) return

                    if (direction && direction.indexOf('W') > -1) {
                        addClass(weatherElement, 'wind-west')
                    } else {
                        addClass(weatherElement, 'wind-east')
                    }
                }

                function addWindToDOM(weatherElement, wind, isDataOnly) {
                    if (!wind.speed && wind.speed !== 0) {
                        document.getElementByClass('wind').innerHTML = ''
                        return
                    }

                    const noWind = wind.speed == 0
                    addWindSpeed(weatherElement, wind.speed, noWind || isDataOnly)
                    addWindDirection(weatherElement, wind.deg, noWind || isDataOnly)
                    require('./styles/wind.scss')
                }

                module.exports = addWindToDOM
            },
            { './styles/wind.scss': 27, './utils/addClass': 28, './utils/getCardinalWindDirection': 29 },
        ],
        16: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        17: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.mist .cloud,.mist .puff,.mist .cloud:after,.mist .puff:after{background:rgba(200,200,255,0.5);transform:translateY(140px) scaleY(0.4);filter:blur(30px)}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        18: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.smoke .cloud,.smoke .puff,.smoke .cloud:after,.smoke .puff:after{background:rgba(200,160,120,0.3);transform:translateX(-80px) translateY(30px) scaleY(2.5);filter:blur(30px)}.smoke #sun{opacity:.8}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        19: [
            function(require, module, exports) {
                var css =
                    '#lightning{z-index:8;position:absolute;top:0;left:0;height:var(--weather-height);width:var(--frame-width);opacity:0;animation:lightningDay 6s linear infinite -4s}.night #lightning{animation:lightningNight 6s linear infinite -4s}@keyframes lightningDay{98.5%{opacity:0}99%{opacity:1;background:#ffffe6}100%{opacity:0}}@keyframes lightningNight{98.5%{opacity:0}99%{opacity:1;background:#ffffc8}100%{opacity:0}}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        20: [
            function(require, module, exports) {
                var css =
                    "#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{content:'';position:absolute}#generic-skyline,#extra-skyline{z-index:4}#great-wheel,#smith-tower,.columbia-tower{z-index:5}#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{content:'';position:absolute}#generic-skyline,#extra-skyline{z-index:4}#great-wheel,#smith-tower,.columbia-tower{z-index:5}#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{height:100%;width:100%}#generic-skyline{position:absolute;top:65%;height:40%;width:80%;left:20%;background:#666;clip-path:polygon(0% 100%, 0% 70%, 17% 70%, 17% 47%, 22% 46%, 22% 68%, 23% 68%, 24% 63%, 25% 57%, 27% 63%, 28% 35%, 31% 35%, 34% 30%, 36% 35%, 38% 35%, 38% 48%, 42% 48%, 43% 40%, 45% 40%, 52% 38%, 53% 50%, 51% 50%, 55% 51%, 55% 26%, 57% 22%, 58% 17%, 63% 17%, 64% 57%, 67% 57%, 68% 43%, 72% 43%, 73% 25%, 77% 24%, 78% 50%, 80% 54%, 84% 54%, 84% 48%, 88% 48%, 89% 39%, 94% 39%, 94% 30%, 100% 29%, 100% 100%)}#generic-skyline:before{background:rgba(255,255,255,0.2);clip-path:polygon(28% 35%, 31% 35%, 34% 30%, 36% 35%)}#generic-skyline:after{background:rgba(100,200,200,0.5);clip-path:polygon(57% 22%, 58% 17%, 63% 17%, 61% 23%)}#extra-skyline{position:absolute;top:94%;height:8%;width:20%;background:#666}.night #generic-skyline,.night #extra-skyline{background:#123}.night #generic-skyline:before{background:rgba(51,204,255,0.4)}.night #generic-skyline:after{background:#123}#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{content:'';position:absolute}#generic-skyline,#extra-skyline{z-index:4}#great-wheel,#smith-tower,.columbia-tower{z-index:5}@keyframes wheel{25%{transform:rotate(360deg);border-color:#f36;box-shadow:0 0 8px 1px #f36}50%{transform:rotate(720deg);border-color:#fff;box-shadow:0 0 8px 1px #fff}75%{transform:rotate(1080deg);border-color:#fc6;box-shadow:0 0 8px 1px #fc6}100%{transform:rotate(1440deg);border-color:#3cf;box-shadow:0 0 8px 1px #3cf}}@keyframes spoke{20%{background:#f36}40%{background:#fc6}60%{background:radial-gradient(ellipse at 50%, #3cf, #3cf 10%, #29c 20%, #000 35%, #fc6 90%)}80%{background:#3cf}100%{background:#3f6}}#great-wheel{position:absolute;top:88%;left:1%;height:calc(var(--frame-width) / 10);width:calc(var(--frame-width) / 10);border-radius:50%;box-sizing:border-box;overflow:hidden;border:2px solid #333}#great-wheel .spoke{position:absolute;left:calc(var(--frame-width) / -20 - 2px);top:-2px;height:calc(var(--frame-width) / 10);width:calc(var(--frame-width) / 5);background:#444}#great-wheel .spoke-1{clip-path:polygon(48% 0, 51% 0, 51% 100%, 48% 100%)}#great-wheel .spoke-2{clip-path:polygon(3% 0, 0 3%, 97% 100%, 100% 97%)}#great-wheel .spoke-3{clip-path:polygon(97% 0, 100% 3%, 3% 100%, 0 97%)}#great-wheel .spoke-4{clip-path:polygon(30% 100%, 33% 100%, 70% 0, 67% 0)}#great-wheel .spoke-5{clip-path:polygon(67% 100%, 70% 100%, 33% 0, 30% 0)}#great-wheel .spoke-6{clip-path:polygon(100% 62%, 100% 66%, 0 38%, 0 34%)}#great-wheel .spoke-7{clip-path:polygon(0 64%, 0 68%, 100% 36%, 100% 32%)}.greatWheelOpen #great-wheel{animation:wheel 60s ease-in-out infinite;border-color:#3f6;box-shadow:0 0 8px 1px #3f6}.greatWheelOpen #great-wheel .spoke{background:radial-gradient(ellipse at 50%, #96f, #96f 10%, #fff 20%, #000 35%, #3f6 90%);animation:spoke 100s linear infinite alternate}#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{content:'';position:absolute}#generic-skyline,#extra-skyline{z-index:4}#great-wheel,#smith-tower,.columbia-tower{z-index:5}#smith-tower{position:absolute;top:80%;left:34%;height:22%;width:10%;background:#aaa;clip-path:polygon(0% 100%, 0% 20%, 15% 0, 30% 20%, 30% 60%, 100% 60%, 100% 100%)}#smith-tower-globe{top:79.5%;left:35.2%;height:calc(var(--frame-width) / 200);width:calc(var(--frame-width) / 200);border-radius:50%;background:#fff;box-shadow:0 0 0 0 #fff}.night #smith-tower{background:#345}.night #smith-tower-globe{background:#3cf;box-shadow:0 0 8px 1px #3cf}#generic-skyline:before,#generic-skyline:after,#smith-tower-globe{content:'';position:absolute}#generic-skyline,#extra-skyline{z-index:4}#great-wheel,#smith-tower,.columbia-tower{z-index:5}.columbia-tower{background:#456;position:absolute;top:65%;left:54%}.night .columbia-tower{background:#012}.night .columbia-tower:after{content:'';position:absolute;height:1px;width:100%;background:#e2f;box-shadow:0 0 4px 1px #e2f}.columbia-tower-1{height:35%;width:4%}.columbia-tower-2{height:30%;width:5%;top:70%}.columbia-tower-3{height:20%;width:1%;top:80%;left:58.5%}:root{--frame-width: 800px;--half-frame-width: 400px;--light-position: 120px;--light-size: 70px}@media all and (max-width: 992px){:root{--frame-width: 400px;--half-frame-width: 200px;--light-position: 60px;--light-size: 50px}}:root{--wind-frame-size: calc(var(--frame-width) * 1.5);--weather-height: calc(var(--frame-width) / 5 * 4);--weather-width: var(--frame-width)}.frame{position:absolute;top:50%;left:50%;width:var(--frame-width);height:var(--frame-width);margin-top:calc(-1 * var(--half-frame-width));margin-left:calc(-1 * var(--half-frame-width));border-radius:2px;box-shadow:0 0 16px 0 rgba(0,0,0,0.2);overflow:hidden;font-family:'Droid Sans', Helvetica, sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.center{position:relative;height:100%;width:100%}#loading{z-index:8;position:absolute;height:var(--frame-width);width:var(--frame-width);background:#ccc;opacity:1;top:0;transition:all 1s}#loading.loaded{opacity:0;top:calc(-1 * var(--frame-width))}#spinner{position:absolute;top:calc(50% - .5 * var(--light-size));left:calc(50% - .5 * var(--light-size));background:#fc6;height:var(--light-size);width:var(--light-size);animation:spinHorizontal 1s ease-in-out infinite alternate;opacity:1;transition:all .3s}.loaded #spinner{opacity:0}#drop{height:calc(.5 * var(--light-size));width:calc(.5 * var(--light-size));border-bottom-right-radius:50%;border-bottom-left-radius:50%;border-top-left-radius:50%;transform:rotate(-45deg);background:#acf}@keyframes spinHorizontal{0%{transform:rotateY(0deg)}100%{background:#69f;transform:rotateY(360deg)}}#weather{height:var(--weather-height);width:var(--frame-width);position:relative;overflow:hidden}.hidden{display:none}.flex{display:flex;justify-content:center;align-items:center}.clouds,.rain,.snow{background:#ccf}.clear,.mist,.smoke{background:#69f}#data{height:calc(var(--frame-width) / 5);width:var(--frame-width);flex-flow:row nowrap;justify-content:space-around;background:#ccc}.temperatures{flex-flow:column}.temperatures h2{margin:0}\n"
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        21: [
            function(require, module, exports) {
                var css =
                    '.night{background:#136}.night .cloud,.night .puff,.night .cloud:after,.night .puff:after{background:rgba(150,150,150,0.8)}.night.light .cloud,.night.light .puff,.night.light .cloud:after,.night.light .puff:after{background:rgba(150,150,150,0.7)}.night.heavy .cloud,.night.heavy .puff,.night.heavy .cloud:after,.night.heavy .puff:after{background:rgba(150,150,150,0.9)}.night.mist .cloud,.night.mist .puff,.night.mist .cloud:after,.night.mist .puff:after{background:rgba(150,150,200,0.4)}.night.smoke .cloud,.night.smoke .puff,.night.smoke .cloud:after,.night.smoke .puff:after{background:rgba(150,100,50,0.2)}.star{z-index:1;position:absolute;box-shadow:0 0 1px 1px #fff}.star-1{top:90%;left:97%}.star-2{top:16%;left:76%}.star-3{top:5%;left:60%}.star-4{top:13%;left:63%}.star-5{top:69%;left:65%}.star-6{top:27%;left:60%}.star-7{top:72%;left:81%}.star-8{top:78%;left:68%}.star-9{top:70%;left:40%}.star-10{top:46%;left:36%}.star-11{top:81%;left:80%}.star-12{top:53%;left:1%}.star-13{top:8%;left:60%}.star-14{top:24%;left:69%}.star-15{top:46%;left:46%}.star-16{top:99%;left:71%}.star-17{top:64%;left:95%}.star-18{top:66%;left:75%}.star-19{top:61%;left:68%}.star-20{top:10%;left:55%}.star-21{top:41%;left:53%}.star-22{top:93%;left:93%}.star-23{top:82%;left:72%}.star-24{top:85%;left:78%}.star-25{top:7%;left:81%}.star-26{top:61%;left:22%}.star-27{top:73%;left:74%}.star-28{top:29%;left:57%}.star-29{top:75%;left:88%}.star-30{top:47%;left:20%}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        22: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.isFalling .weather{z-index:6;position:absolute;top:calc(var(--frame-width) / -40);opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 2.8s infinite linear .6s}.wind-east .tiny.weather-1{animation:falling-1-east 2.8s infinite linear .6s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 2.8s infinite linear .6s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 2.8s infinite linear .6s}.wind-west .tiny.weather-1{animation:falling-1-west 2.8s infinite linear .6s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 2.8s infinite linear .6s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 2.8s infinite linear .6s}.tiny.weather-2{animation:falling-2 1.6s infinite linear .6s}.wind-east .tiny.weather-2{animation:falling-2-east 1.6s infinite linear .6s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 1.6s infinite linear .6s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 1.6s infinite linear .6s}.wind-west .tiny.weather-2{animation:falling-2-west 1.6s infinite linear .6s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 1.6s infinite linear .6s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 1.6s infinite linear .6s}.tiny.weather-3{animation:falling-3 1.4s infinite linear 1.4s}.wind-east .tiny.weather-3{animation:falling-3-east 1.4s infinite linear 1.4s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 1.4s infinite linear 1.4s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 1.4s infinite linear 1.4s}.wind-west .tiny.weather-3{animation:falling-3-west 1.4s infinite linear 1.4s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 1.4s infinite linear 1.4s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 1.4s infinite linear 1.4s}.tiny.weather-4{animation:falling-4 1.3s infinite linear 1.3s}.wind-east .tiny.weather-4{animation:falling-4-east 1.3s infinite linear 1.3s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 1.3s infinite linear 1.3s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 1.3s infinite linear 1.3s}.wind-west .tiny.weather-4{animation:falling-4-west 1.3s infinite linear 1.3s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 1.3s infinite linear 1.3s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 1.3s infinite linear 1.3s}.tiny.weather-5{animation:falling-5 2.3s infinite linear 1.2s}.wind-east .tiny.weather-5{animation:falling-5-east 2.3s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 2.3s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 2.3s infinite linear 1.2s}.wind-west .tiny.weather-5{animation:falling-5-west 2.3s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 2.3s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 2.3s infinite linear 1.2s}.tiny.weather-6{animation:falling-6 1.3s infinite linear .4s}.wind-east .tiny.weather-6{animation:falling-6-east 1.3s infinite linear .4s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 1.3s infinite linear .4s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 1.3s infinite linear .4s}.wind-west .tiny.weather-6{animation:falling-6-west 1.3s infinite linear .4s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 1.3s infinite linear .4s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 1.3s infinite linear .4s}.tiny.weather-7{animation:falling-7 2s infinite linear .5s}.wind-east .tiny.weather-7{animation:falling-7-east 2s infinite linear .5s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 2s infinite linear .5s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 2s infinite linear .5s}.wind-west .tiny.weather-7{animation:falling-7-west 2s infinite linear .5s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 2s infinite linear .5s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 2s infinite linear .5s}.tiny.weather-8{animation:falling-8 1.8s infinite linear 1.1s}.wind-east .tiny.weather-8{animation:falling-8-east 1.8s infinite linear 1.1s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 1.8s infinite linear 1.1s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 1.8s infinite linear 1.1s}.wind-west .tiny.weather-8{animation:falling-8-west 1.8s infinite linear 1.1s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 1.8s infinite linear 1.1s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 1.8s infinite linear 1.1s}.tiny.weather-9{animation:falling-9 2.2s infinite linear .1s}.wind-east .tiny.weather-9{animation:falling-9-east 2.2s infinite linear .1s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 2.2s infinite linear .1s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 2.2s infinite linear .1s}.wind-west .tiny.weather-9{animation:falling-9-west 2.2s infinite linear .1s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 2.2s infinite linear .1s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 2.2s infinite linear .1s}.tiny.weather-10{animation:falling-10 1.2s infinite linear .9s}.wind-east .tiny.weather-10{animation:falling-10-east 1.2s infinite linear .9s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 1.2s infinite linear .9s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 1.2s infinite linear .9s}.wind-west .tiny.weather-10{animation:falling-10-west 1.2s infinite linear .9s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 1.2s infinite linear .9s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 1.2s infinite linear .9s}.small.weather{height:26px;width:13px;background:rgba(100,130,255,0.75)}.small.weather-1{animation:falling-1 2.5s infinite linear .2s}.wind-east .small.weather-1{animation:falling-1-east 2.5s infinite linear .2s}.wind-east.wind-med .small.weather-1{animation:falling-1-east-med 2.5s infinite linear .2s}.wind-east.wind-high .small.weather-1{animation:falling-1-east-high 2.5s infinite linear .2s}.wind-west .small.weather-1{animation:falling-1-west 2.5s infinite linear .2s}.wind-west.wind-med .small.weather-1{animation:falling-1-west-med 2.5s infinite linear .2s}.wind-west.wind-high .small.weather-1{animation:falling-1-west-high 2.5s infinite linear .2s}.small.weather-2{animation:falling-2 2s infinite linear .2s}.wind-east .small.weather-2{animation:falling-2-east 2s infinite linear .2s}.wind-east.wind-med .small.weather-2{animation:falling-2-east-med 2s infinite linear .2s}.wind-east.wind-high .small.weather-2{animation:falling-2-east-high 2s infinite linear .2s}.wind-west .small.weather-2{animation:falling-2-west 2s infinite linear .2s}.wind-west.wind-med .small.weather-2{animation:falling-2-west-med 2s infinite linear .2s}.wind-west.wind-high .small.weather-2{animation:falling-2-west-high 2s infinite linear .2s}.small.weather-3{animation:falling-3 1.3s infinite linear .3s}.wind-east .small.weather-3{animation:falling-3-east 1.3s infinite linear .3s}.wind-east.wind-med .small.weather-3{animation:falling-3-east-med 1.3s infinite linear .3s}.wind-east.wind-high .small.weather-3{animation:falling-3-east-high 1.3s infinite linear .3s}.wind-west .small.weather-3{animation:falling-3-west 1.3s infinite linear .3s}.wind-west.wind-med .small.weather-3{animation:falling-3-west-med 1.3s infinite linear .3s}.wind-west.wind-high .small.weather-3{animation:falling-3-west-high 1.3s infinite linear .3s}.small.weather-4{animation:falling-4 1.1s infinite linear .6s}.wind-east .small.weather-4{animation:falling-4-east 1.1s infinite linear .6s}.wind-east.wind-med .small.weather-4{animation:falling-4-east-med 1.1s infinite linear .6s}.wind-east.wind-high .small.weather-4{animation:falling-4-east-high 1.1s infinite linear .6s}.wind-west .small.weather-4{animation:falling-4-west 1.1s infinite linear .6s}.wind-west.wind-med .small.weather-4{animation:falling-4-west-med 1.1s infinite linear .6s}.wind-west.wind-high .small.weather-4{animation:falling-4-west-high 1.1s infinite linear .6s}.small.weather-5{animation:falling-5 2.9s infinite linear .8s}.wind-east .small.weather-5{animation:falling-5-east 2.9s infinite linear .8s}.wind-east.wind-med .small.weather-5{animation:falling-5-east-med 2.9s infinite linear .8s}.wind-east.wind-high .small.weather-5{animation:falling-5-east-high 2.9s infinite linear .8s}.wind-west .small.weather-5{animation:falling-5-west 2.9s infinite linear .8s}.wind-west.wind-med .small.weather-5{animation:falling-5-west-med 2.9s infinite linear .8s}.wind-west.wind-high .small.weather-5{animation:falling-5-west-high 2.9s infinite linear .8s}.small.weather-6{animation:falling-6 1.1s infinite linear .4s}.wind-east .small.weather-6{animation:falling-6-east 1.1s infinite linear .4s}.wind-east.wind-med .small.weather-6{animation:falling-6-east-med 1.1s infinite linear .4s}.wind-east.wind-high .small.weather-6{animation:falling-6-east-high 1.1s infinite linear .4s}.wind-west .small.weather-6{animation:falling-6-west 1.1s infinite linear .4s}.wind-west.wind-med .small.weather-6{animation:falling-6-west-med 1.1s infinite linear .4s}.wind-west.wind-high .small.weather-6{animation:falling-6-west-high 1.1s infinite linear .4s}.small.weather-7{animation:falling-7 2.8s infinite linear 1s}.wind-east .small.weather-7{animation:falling-7-east 2.8s infinite linear 1s}.wind-east.wind-med .small.weather-7{animation:falling-7-east-med 2.8s infinite linear 1s}.wind-east.wind-high .small.weather-7{animation:falling-7-east-high 2.8s infinite linear 1s}.wind-west .small.weather-7{animation:falling-7-west 2.8s infinite linear 1s}.wind-west.wind-med .small.weather-7{animation:falling-7-west-med 2.8s infinite linear 1s}.wind-west.wind-high .small.weather-7{animation:falling-7-west-high 2.8s infinite linear 1s}.small.weather-8{animation:falling-8 2s infinite linear .8s}.wind-east .small.weather-8{animation:falling-8-east 2s infinite linear .8s}.wind-east.wind-med .small.weather-8{animation:falling-8-east-med 2s infinite linear .8s}.wind-east.wind-high .small.weather-8{animation:falling-8-east-high 2s infinite linear .8s}.wind-west .small.weather-8{animation:falling-8-west 2s infinite linear .8s}.wind-west.wind-med .small.weather-8{animation:falling-8-west-med 2s infinite linear .8s}.wind-west.wind-high .small.weather-8{animation:falling-8-west-high 2s infinite linear .8s}.small.weather-9{animation:falling-9 1.9s infinite linear .7s}.wind-east .small.weather-9{animation:falling-9-east 1.9s infinite linear .7s}.wind-east.wind-med .small.weather-9{animation:falling-9-east-med 1.9s infinite linear .7s}.wind-east.wind-high .small.weather-9{animation:falling-9-east-high 1.9s infinite linear .7s}.wind-west .small.weather-9{animation:falling-9-west 1.9s infinite linear .7s}.wind-west.wind-med .small.weather-9{animation:falling-9-west-med 1.9s infinite linear .7s}.wind-west.wind-high .small.weather-9{animation:falling-9-west-high 1.9s infinite linear .7s}.small.weather-10{animation:falling-10 2.9s infinite linear .8s}.wind-east .small.weather-10{animation:falling-10-east 2.9s infinite linear .8s}.wind-east.wind-med .small.weather-10{animation:falling-10-east-med 2.9s infinite linear .8s}.wind-east.wind-high .small.weather-10{animation:falling-10-east-high 2.9s infinite linear .8s}.wind-west .small.weather-10{animation:falling-10-west 2.9s infinite linear .8s}.wind-west.wind-med .small.weather-10{animation:falling-10-west-med 2.9s infinite linear .8s}.wind-west.wind-high .small.weather-10{animation:falling-10-west-high 2.9s infinite linear .8s}.large.weather{height:30px;width:16px;background:rgba(100,130,255,0.9)}.large.weather-1{animation:falling-1 1.7s infinite linear 1.5s}.wind-east .large.weather-1{animation:falling-1-east 1.7s infinite linear 1.5s}.wind-east.wind-med .large.weather-1{animation:falling-1-east-med 1.7s infinite linear 1.5s}.wind-east.wind-high .large.weather-1{animation:falling-1-east-high 1.7s infinite linear 1.5s}.wind-west .large.weather-1{animation:falling-1-west 1.7s infinite linear 1.5s}.wind-west.wind-med .large.weather-1{animation:falling-1-west-med 1.7s infinite linear 1.5s}.wind-west.wind-high .large.weather-1{animation:falling-1-west-high 1.7s infinite linear 1.5s}.large.weather-2{animation:falling-2 2.9s infinite linear 1.2s}.wind-east .large.weather-2{animation:falling-2-east 2.9s infinite linear 1.2s}.wind-east.wind-med .large.weather-2{animation:falling-2-east-med 2.9s infinite linear 1.2s}.wind-east.wind-high .large.weather-2{animation:falling-2-east-high 2.9s infinite linear 1.2s}.wind-west .large.weather-2{animation:falling-2-west 2.9s infinite linear 1.2s}.wind-west.wind-med .large.weather-2{animation:falling-2-west-med 2.9s infinite linear 1.2s}.wind-west.wind-high .large.weather-2{animation:falling-2-west-high 2.9s infinite linear 1.2s}.large.weather-3{animation:falling-3 1.3s infinite linear 1.4s}.wind-east .large.weather-3{animation:falling-3-east 1.3s infinite linear 1.4s}.wind-east.wind-med .large.weather-3{animation:falling-3-east-med 1.3s infinite linear 1.4s}.wind-east.wind-high .large.weather-3{animation:falling-3-east-high 1.3s infinite linear 1.4s}.wind-west .large.weather-3{animation:falling-3-west 1.3s infinite linear 1.4s}.wind-west.wind-med .large.weather-3{animation:falling-3-west-med 1.3s infinite linear 1.4s}.wind-west.wind-high .large.weather-3{animation:falling-3-west-high 1.3s infinite linear 1.4s}.large.weather-4{animation:falling-4 2.2s infinite linear 1.4s}.wind-east .large.weather-4{animation:falling-4-east 2.2s infinite linear 1.4s}.wind-east.wind-med .large.weather-4{animation:falling-4-east-med 2.2s infinite linear 1.4s}.wind-east.wind-high .large.weather-4{animation:falling-4-east-high 2.2s infinite linear 1.4s}.wind-west .large.weather-4{animation:falling-4-west 2.2s infinite linear 1.4s}.wind-west.wind-med .large.weather-4{animation:falling-4-west-med 2.2s infinite linear 1.4s}.wind-west.wind-high .large.weather-4{animation:falling-4-west-high 2.2s infinite linear 1.4s}.large.weather-5{animation:falling-5 2.4s infinite linear 1.2s}.wind-east .large.weather-5{animation:falling-5-east 2.4s infinite linear 1.2s}.wind-east.wind-med .large.weather-5{animation:falling-5-east-med 2.4s infinite linear 1.2s}.wind-east.wind-high .large.weather-5{animation:falling-5-east-high 2.4s infinite linear 1.2s}.wind-west .large.weather-5{animation:falling-5-west 2.4s infinite linear 1.2s}.wind-west.wind-med .large.weather-5{animation:falling-5-west-med 2.4s infinite linear 1.2s}.wind-west.wind-high .large.weather-5{animation:falling-5-west-high 2.4s infinite linear 1.2s}.large.weather-6{animation:falling-6 2.9s infinite linear 1.2s}.wind-east .large.weather-6{animation:falling-6-east 2.9s infinite linear 1.2s}.wind-east.wind-med .large.weather-6{animation:falling-6-east-med 2.9s infinite linear 1.2s}.wind-east.wind-high .large.weather-6{animation:falling-6-east-high 2.9s infinite linear 1.2s}.wind-west .large.weather-6{animation:falling-6-west 2.9s infinite linear 1.2s}.wind-west.wind-med .large.weather-6{animation:falling-6-west-med 2.9s infinite linear 1.2s}.wind-west.wind-high .large.weather-6{animation:falling-6-west-high 2.9s infinite linear 1.2s}.large.weather-7{animation:falling-7 2.5s infinite linear .3s}.wind-east .large.weather-7{animation:falling-7-east 2.5s infinite linear .3s}.wind-east.wind-med .large.weather-7{animation:falling-7-east-med 2.5s infinite linear .3s}.wind-east.wind-high .large.weather-7{animation:falling-7-east-high 2.5s infinite linear .3s}.wind-west .large.weather-7{animation:falling-7-west 2.5s infinite linear .3s}.wind-west.wind-med .large.weather-7{animation:falling-7-west-med 2.5s infinite linear .3s}.wind-west.wind-high .large.weather-7{animation:falling-7-west-high 2.5s infinite linear .3s}.large.weather-8{animation:falling-8 2.5s infinite linear .3s}.wind-east .large.weather-8{animation:falling-8-east 2.5s infinite linear .3s}.wind-east.wind-med .large.weather-8{animation:falling-8-east-med 2.5s infinite linear .3s}.wind-east.wind-high .large.weather-8{animation:falling-8-east-high 2.5s infinite linear .3s}.wind-west .large.weather-8{animation:falling-8-west 2.5s infinite linear .3s}.wind-west.wind-med .large.weather-8{animation:falling-8-west-med 2.5s infinite linear .3s}.wind-west.wind-high .large.weather-8{animation:falling-8-west-high 2.5s infinite linear .3s}.large.weather-9{animation:falling-9 1.9s infinite linear .5s}.wind-east .large.weather-9{animation:falling-9-east 1.9s infinite linear .5s}.wind-east.wind-med .large.weather-9{animation:falling-9-east-med 1.9s infinite linear .5s}.wind-east.wind-high .large.weather-9{animation:falling-9-east-high 1.9s infinite linear .5s}.wind-west .large.weather-9{animation:falling-9-west 1.9s infinite linear .5s}.wind-west.wind-med .large.weather-9{animation:falling-9-west-med 1.9s infinite linear .5s}.wind-west.wind-high .large.weather-9{animation:falling-9-west-high 1.9s infinite linear .5s}.large.weather-10{animation:falling-10 1.9s infinite linear .6s}.wind-east .large.weather-10{animation:falling-10-east 1.9s infinite linear .6s}.wind-east.wind-med .large.weather-10{animation:falling-10-east-med 1.9s infinite linear .6s}.wind-east.wind-high .large.weather-10{animation:falling-10-east-high 1.9s infinite linear .6s}.wind-west .large.weather-10{animation:falling-10-west 1.9s infinite linear .6s}.wind-west.wind-med .large.weather-10{animation:falling-10-west-med 1.9s infinite linear .6s}.wind-west.wind-high .large.weather-10{animation:falling-10-west-high 1.9s infinite linear .6s}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        23: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.isFalling .weather{z-index:6;position:absolute;top:calc(var(--frame-width) / -40);opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 1.8s infinite linear .6s}.wind-east .tiny.weather-1{animation:falling-1-east 1.8s infinite linear .6s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 1.8s infinite linear .6s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 1.8s infinite linear .6s}.wind-west .tiny.weather-1{animation:falling-1-west 1.8s infinite linear .6s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 1.8s infinite linear .6s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 1.8s infinite linear .6s}.tiny.weather-2{animation:falling-2 1.7s infinite linear .8s}.wind-east .tiny.weather-2{animation:falling-2-east 1.7s infinite linear .8s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 1.7s infinite linear .8s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 1.7s infinite linear .8s}.wind-west .tiny.weather-2{animation:falling-2-west 1.7s infinite linear .8s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 1.7s infinite linear .8s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 1.7s infinite linear .8s}.tiny.weather-3{animation:falling-3 1.8s infinite linear 1s}.wind-east .tiny.weather-3{animation:falling-3-east 1.8s infinite linear 1s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 1.8s infinite linear 1s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 1.8s infinite linear 1s}.wind-west .tiny.weather-3{animation:falling-3-west 1.8s infinite linear 1s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 1.8s infinite linear 1s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 1.8s infinite linear 1s}.tiny.weather-4{animation:falling-4 1.7s infinite linear .6s}.wind-east .tiny.weather-4{animation:falling-4-east 1.7s infinite linear .6s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 1.7s infinite linear .6s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 1.7s infinite linear .6s}.wind-west .tiny.weather-4{animation:falling-4-west 1.7s infinite linear .6s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 1.7s infinite linear .6s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 1.7s infinite linear .6s}.tiny.weather-5{animation:falling-5 3s infinite linear .8s}.wind-east .tiny.weather-5{animation:falling-5-east 3s infinite linear .8s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 3s infinite linear .8s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 3s infinite linear .8s}.wind-west .tiny.weather-5{animation:falling-5-west 3s infinite linear .8s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 3s infinite linear .8s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 3s infinite linear .8s}.tiny.weather-6{animation:falling-6 2.5s infinite linear .5s}.wind-east .tiny.weather-6{animation:falling-6-east 2.5s infinite linear .5s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 2.5s infinite linear .5s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 2.5s infinite linear .5s}.wind-west .tiny.weather-6{animation:falling-6-west 2.5s infinite linear .5s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 2.5s infinite linear .5s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 2.5s infinite linear .5s}.tiny.weather-7{animation:falling-7 1.9s infinite linear .8s}.wind-east .tiny.weather-7{animation:falling-7-east 1.9s infinite linear .8s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 1.9s infinite linear .8s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 1.9s infinite linear .8s}.wind-west .tiny.weather-7{animation:falling-7-west 1.9s infinite linear .8s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 1.9s infinite linear .8s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 1.9s infinite linear .8s}.tiny.weather-8{animation:falling-8 1.6s infinite linear 1.2s}.wind-east .tiny.weather-8{animation:falling-8-east 1.6s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 1.6s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 1.6s infinite linear 1.2s}.wind-west .tiny.weather-8{animation:falling-8-west 1.6s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 1.6s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 1.6s infinite linear 1.2s}.tiny.weather-9{animation:falling-9 2.9s infinite linear 1s}.wind-east .tiny.weather-9{animation:falling-9-east 2.9s infinite linear 1s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 2.9s infinite linear 1s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 2.9s infinite linear 1s}.wind-west .tiny.weather-9{animation:falling-9-west 2.9s infinite linear 1s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 2.9s infinite linear 1s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 2.9s infinite linear 1s}.tiny.weather-10{animation:falling-10 2.1s infinite linear .3s}.wind-east .tiny.weather-10{animation:falling-10-east 2.1s infinite linear .3s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 2.1s infinite linear .3s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 2.1s infinite linear .3s}.wind-west .tiny.weather-10{animation:falling-10-west 2.1s infinite linear .3s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 2.1s infinite linear .3s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 2.1s infinite linear .3s}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        24: [
            function(require, module, exports) {
                var css =
                    '.cloud,.puff,.cloud:after,.puff:after{position:absolute;background:rgba(255,255,255,0.8);border-radius:50%;z-index:7}.light .cloud,.light .puff,.light .cloud:after,.light .puff:after{background:rgba(255,255,255,0.7);transform:scale(0.7) translateY(-30%)}.heavy .cloud,.heavy .puff,.heavy .cloud:after,.heavy .puff:after{background:rgba(255,255,255,0.9);transform:scale(1.6) translateY(-30%)}.isFalling .cloud,.isFalling .puff,.isFalling .cloud:after,.isFalling .puff:after{background:rgba(255,255,255,0.8)}.cloud,.cloud:after{height:100px;filter:blur(10px)}.puff,.puff:after{height:80px;width:250px;filter:blur(15px)}.cloud.one{top:-10px;left:-30px;width:500px}.cloud.one:after{width:500px}.cloud.two{top:40px;left:80px;width:300px}.cloud.two:after{width:300px}.cloud.three{top:80px;left:180px;width:400px}.cloud.three:after{width:400px}.puff.one{top:120px;left:20px}.puff.two{top:140px;left:120px}.puff.three{top:50px;left:330px}.isFalling .weather{z-index:6;position:absolute;top:calc(var(--frame-width) / -40);opacity:0;border-radius:50%}.tiny.weather{height:16px;width:8px;background:rgba(100,130,255,0.6)}.weather-1{left:36.36364px}@keyframes falling-1{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:48.86364px}}.wind-east .weather-1{left:36.36364px}@keyframes falling-1-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:13.63636px}}.wind-east.wind-med .weather-1{left:81.81818px}@keyframes falling-1-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-9.09091px}}.wind-east.wind-high .weather-1{left:127.27273px}@keyframes falling-1-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-54.54545px}}.wind-west .weather-1{left:-54.54545px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west.wind-med .weather-1{left:-9.09091px}@keyframes falling-1-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:81.81818px}}.wind-west.wind-high .weather-1{left:-54.54545px}@keyframes falling-1-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.weather-2{left:72.72727px}@keyframes falling-2{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:85.22727px}}.wind-east .weather-2{left:72.72727px}@keyframes falling-2-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:50px}}.wind-east.wind-med .weather-2{left:118.18182px}@keyframes falling-2-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:27.27273px}}.wind-east.wind-high .weather-2{left:163.63636px}@keyframes falling-2-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:-18.18182px}}.wind-west .weather-2{left:-18.18182px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west.wind-med .weather-2{left:27.27273px}@keyframes falling-2-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:118.18182px}}.wind-west.wind-high .weather-2{left:-18.18182px}@keyframes falling-2-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.weather-3{left:109.09091px}@keyframes falling-3{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:121.59091px}}.wind-east .weather-3{left:109.09091px}@keyframes falling-3-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:86.36364px}}.wind-east.wind-med .weather-3{left:154.54545px}@keyframes falling-3-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:63.63636px}}.wind-east.wind-high .weather-3{left:200px}@keyframes falling-3-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:18.18182px}}.wind-west .weather-3{left:18.18182px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west.wind-med .weather-3{left:63.63636px}@keyframes falling-3-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:154.54545px}}.wind-west.wind-high .weather-3{left:18.18182px}@keyframes falling-3-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.weather-4{left:145.45455px}@keyframes falling-4{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:157.95455px}}.wind-east .weather-4{left:145.45455px}@keyframes falling-4-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:122.72727px}}.wind-east.wind-med .weather-4{left:190.90909px}@keyframes falling-4-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:100px}}.wind-east.wind-high .weather-4{left:236.36364px}@keyframes falling-4-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:54.54545px}}.wind-west .weather-4{left:54.54545px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west.wind-med .weather-4{left:100px}@keyframes falling-4-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:190.90909px}}.wind-west.wind-high .weather-4{left:54.54545px}@keyframes falling-4-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.weather-5{left:181.81818px}@keyframes falling-5{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:194.31818px}}.wind-east .weather-5{left:181.81818px}@keyframes falling-5-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:159.09091px}}.wind-east.wind-med .weather-5{left:227.27273px}@keyframes falling-5-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:136.36364px}}.wind-east.wind-high .weather-5{left:272.72727px}@keyframes falling-5-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:90.90909px}}.wind-west .weather-5{left:90.90909px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west.wind-med .weather-5{left:136.36364px}@keyframes falling-5-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:227.27273px}}.wind-west.wind-high .weather-5{left:90.90909px}@keyframes falling-5-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.weather-6{left:218.18182px}@keyframes falling-6{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:230.68182px}}.wind-east .weather-6{left:218.18182px}@keyframes falling-6-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:195.45455px}}.wind-east.wind-med .weather-6{left:263.63636px}@keyframes falling-6-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:172.72727px}}.wind-east.wind-high .weather-6{left:309.09091px}@keyframes falling-6-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:127.27273px}}.wind-west .weather-6{left:127.27273px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.wind-west.wind-med .weather-6{left:172.72727px}@keyframes falling-6-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:263.63636px}}.wind-west.wind-high .weather-6{left:127.27273px}@keyframes falling-6-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:309.09091px}}.weather-7{left:254.54545px}@keyframes falling-7{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:267.04545px}}.wind-east .weather-7{left:254.54545px}@keyframes falling-7-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:231.81818px}}.wind-east.wind-med .weather-7{left:300px}@keyframes falling-7-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:209.09091px}}.wind-east.wind-high .weather-7{left:345.45455px}@keyframes falling-7-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:163.63636px}}.wind-west .weather-7{left:163.63636px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.wind-west.wind-med .weather-7{left:209.09091px}@keyframes falling-7-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:300px}}.wind-west.wind-high .weather-7{left:163.63636px}@keyframes falling-7-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:345.45455px}}.weather-8{left:290.90909px}@keyframes falling-8{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:303.40909px}}.wind-east .weather-8{left:290.90909px}@keyframes falling-8-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:268.18182px}}.wind-east.wind-med .weather-8{left:336.36364px}@keyframes falling-8-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:245.45455px}}.wind-east.wind-high .weather-8{left:381.81818px}@keyframes falling-8-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:200px}}.wind-west .weather-8{left:200px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.wind-west.wind-med .weather-8{left:245.45455px}@keyframes falling-8-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:336.36364px}}.wind-west.wind-high .weather-8{left:200px}@keyframes falling-8-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:381.81818px}}.weather-9{left:327.27273px}@keyframes falling-9{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:339.77273px}}.wind-east .weather-9{left:327.27273px}@keyframes falling-9-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:304.54545px}}.wind-east.wind-med .weather-9{left:372.72727px}@keyframes falling-9-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:281.81818px}}.wind-east.wind-high .weather-9{left:418.18182px}@keyframes falling-9-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:236.36364px}}.wind-west .weather-9{left:236.36364px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.wind-west.wind-med .weather-9{left:281.81818px}@keyframes falling-9-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:372.72727px}}.wind-west.wind-high .weather-9{left:236.36364px}@keyframes falling-9-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:418.18182px}}.weather-10{left:363.63636px}@keyframes falling-10{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:376.13636px}}.wind-east .weather-10{left:363.63636px}@keyframes falling-10-east{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:340.90909px}}.wind-east.wind-med .weather-10{left:409.09091px}@keyframes falling-10-east-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:318.18182px}}.wind-east.wind-high .weather-10{left:454.54545px}@keyframes falling-10-east-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:272.72727px}}.wind-west .weather-10{left:272.72727px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.wind-west.wind-med .weather-10{left:318.18182px}@keyframes falling-10-west-med{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:409.09091px}}.wind-west.wind-high .weather-10{left:272.72727px}@keyframes falling-10-west-high{100%{opacity:.4;top:calc(var(--weather-height) + var(--weather-height) / 4);left:454.54545px}}.tiny.weather-1{animation:falling-1 2.9s infinite linear 1.2s}.wind-east .tiny.weather-1{animation:falling-1-east 2.9s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-1{animation:falling-1-east-med 2.9s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-1{animation:falling-1-east-high 2.9s infinite linear 1.2s}.wind-west .tiny.weather-1{animation:falling-1-west 2.9s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-1{animation:falling-1-west-med 2.9s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-1{animation:falling-1-west-high 2.9s infinite linear 1.2s}.tiny.weather-2{animation:falling-2 2.5s infinite linear 1.5s}.wind-east .tiny.weather-2{animation:falling-2-east 2.5s infinite linear 1.5s}.wind-east.wind-med .tiny.weather-2{animation:falling-2-east-med 2.5s infinite linear 1.5s}.wind-east.wind-high .tiny.weather-2{animation:falling-2-east-high 2.5s infinite linear 1.5s}.wind-west .tiny.weather-2{animation:falling-2-west 2.5s infinite linear 1.5s}.wind-west.wind-med .tiny.weather-2{animation:falling-2-west-med 2.5s infinite linear 1.5s}.wind-west.wind-high .tiny.weather-2{animation:falling-2-west-high 2.5s infinite linear 1.5s}.tiny.weather-3{animation:falling-3 1.9s infinite linear .5s}.wind-east .tiny.weather-3{animation:falling-3-east 1.9s infinite linear .5s}.wind-east.wind-med .tiny.weather-3{animation:falling-3-east-med 1.9s infinite linear .5s}.wind-east.wind-high .tiny.weather-3{animation:falling-3-east-high 1.9s infinite linear .5s}.wind-west .tiny.weather-3{animation:falling-3-west 1.9s infinite linear .5s}.wind-west.wind-med .tiny.weather-3{animation:falling-3-west-med 1.9s infinite linear .5s}.wind-west.wind-high .tiny.weather-3{animation:falling-3-west-high 1.9s infinite linear .5s}.tiny.weather-4{animation:falling-4 1.1s infinite linear 1.2s}.wind-east .tiny.weather-4{animation:falling-4-east 1.1s infinite linear 1.2s}.wind-east.wind-med .tiny.weather-4{animation:falling-4-east-med 1.1s infinite linear 1.2s}.wind-east.wind-high .tiny.weather-4{animation:falling-4-east-high 1.1s infinite linear 1.2s}.wind-west .tiny.weather-4{animation:falling-4-west 1.1s infinite linear 1.2s}.wind-west.wind-med .tiny.weather-4{animation:falling-4-west-med 1.1s infinite linear 1.2s}.wind-west.wind-high .tiny.weather-4{animation:falling-4-west-high 1.1s infinite linear 1.2s}.tiny.weather-5{animation:falling-5 2.8s infinite linear 1.3s}.wind-east .tiny.weather-5{animation:falling-5-east 2.8s infinite linear 1.3s}.wind-east.wind-med .tiny.weather-5{animation:falling-5-east-med 2.8s infinite linear 1.3s}.wind-east.wind-high .tiny.weather-5{animation:falling-5-east-high 2.8s infinite linear 1.3s}.wind-west .tiny.weather-5{animation:falling-5-west 2.8s infinite linear 1.3s}.wind-west.wind-med .tiny.weather-5{animation:falling-5-west-med 2.8s infinite linear 1.3s}.wind-west.wind-high .tiny.weather-5{animation:falling-5-west-high 2.8s infinite linear 1.3s}.tiny.weather-6{animation:falling-6 1.2s infinite linear .1s}.wind-east .tiny.weather-6{animation:falling-6-east 1.2s infinite linear .1s}.wind-east.wind-med .tiny.weather-6{animation:falling-6-east-med 1.2s infinite linear .1s}.wind-east.wind-high .tiny.weather-6{animation:falling-6-east-high 1.2s infinite linear .1s}.wind-west .tiny.weather-6{animation:falling-6-west 1.2s infinite linear .1s}.wind-west.wind-med .tiny.weather-6{animation:falling-6-west-med 1.2s infinite linear .1s}.wind-west.wind-high .tiny.weather-6{animation:falling-6-west-high 1.2s infinite linear .1s}.tiny.weather-7{animation:falling-7 1.5s infinite linear .5s}.wind-east .tiny.weather-7{animation:falling-7-east 1.5s infinite linear .5s}.wind-east.wind-med .tiny.weather-7{animation:falling-7-east-med 1.5s infinite linear .5s}.wind-east.wind-high .tiny.weather-7{animation:falling-7-east-high 1.5s infinite linear .5s}.wind-west .tiny.weather-7{animation:falling-7-west 1.5s infinite linear .5s}.wind-west.wind-med .tiny.weather-7{animation:falling-7-west-med 1.5s infinite linear .5s}.wind-west.wind-high .tiny.weather-7{animation:falling-7-west-high 1.5s infinite linear .5s}.tiny.weather-8{animation:falling-8 1.5s infinite linear .4s}.wind-east .tiny.weather-8{animation:falling-8-east 1.5s infinite linear .4s}.wind-east.wind-med .tiny.weather-8{animation:falling-8-east-med 1.5s infinite linear .4s}.wind-east.wind-high .tiny.weather-8{animation:falling-8-east-high 1.5s infinite linear .4s}.wind-west .tiny.weather-8{animation:falling-8-west 1.5s infinite linear .4s}.wind-west.wind-med .tiny.weather-8{animation:falling-8-west-med 1.5s infinite linear .4s}.wind-west.wind-high .tiny.weather-8{animation:falling-8-west-high 1.5s infinite linear .4s}.tiny.weather-9{animation:falling-9 2.8s infinite linear 1.3s}.wind-east .tiny.weather-9{animation:falling-9-east 2.8s infinite linear 1.3s}.wind-east.wind-med .tiny.weather-9{animation:falling-9-east-med 2.8s infinite linear 1.3s}.wind-east.wind-high .tiny.weather-9{animation:falling-9-east-high 2.8s infinite linear 1.3s}.wind-west .tiny.weather-9{animation:falling-9-west 2.8s infinite linear 1.3s}.wind-west.wind-med .tiny.weather-9{animation:falling-9-west-med 2.8s infinite linear 1.3s}.wind-west.wind-high .tiny.weather-9{animation:falling-9-west-high 2.8s infinite linear 1.3s}.tiny.weather-10{animation:falling-10 3s infinite linear .3s}.wind-east .tiny.weather-10{animation:falling-10-east 3s infinite linear .3s}.wind-east.wind-med .tiny.weather-10{animation:falling-10-east-med 3s infinite linear .3s}.wind-east.wind-high .tiny.weather-10{animation:falling-10-east-high 3s infinite linear .3s}.wind-west .tiny.weather-10{animation:falling-10-west 3s infinite linear .3s}.wind-west.wind-med .tiny.weather-10{animation:falling-10-west-med 3s infinite linear .3s}.wind-west.wind-high .tiny.weather-10{animation:falling-10-west-high 3s infinite linear .3s}.small.weather{height:26px;width:13px;background:rgba(100,130,255,0.75)}.small.weather-1{animation:falling-1 2.4s infinite linear .5s}.wind-east .small.weather-1{animation:falling-1-east 2.4s infinite linear .5s}.wind-east.wind-med .small.weather-1{animation:falling-1-east-med 2.4s infinite linear .5s}.wind-east.wind-high .small.weather-1{animation:falling-1-east-high 2.4s infinite linear .5s}.wind-west .small.weather-1{animation:falling-1-west 2.4s infinite linear .5s}.wind-west.wind-med .small.weather-1{animation:falling-1-west-med 2.4s infinite linear .5s}.wind-west.wind-high .small.weather-1{animation:falling-1-west-high 2.4s infinite linear .5s}.small.weather-2{animation:falling-2 1.6s infinite linear .8s}.wind-east .small.weather-2{animation:falling-2-east 1.6s infinite linear .8s}.wind-east.wind-med .small.weather-2{animation:falling-2-east-med 1.6s infinite linear .8s}.wind-east.wind-high .small.weather-2{animation:falling-2-east-high 1.6s infinite linear .8s}.wind-west .small.weather-2{animation:falling-2-west 1.6s infinite linear .8s}.wind-west.wind-med .small.weather-2{animation:falling-2-west-med 1.6s infinite linear .8s}.wind-west.wind-high .small.weather-2{animation:falling-2-west-high 1.6s infinite linear .8s}.small.weather-3{animation:falling-3 3s infinite linear .6s}.wind-east .small.weather-3{animation:falling-3-east 3s infinite linear .6s}.wind-east.wind-med .small.weather-3{animation:falling-3-east-med 3s infinite linear .6s}.wind-east.wind-high .small.weather-3{animation:falling-3-east-high 3s infinite linear .6s}.wind-west .small.weather-3{animation:falling-3-west 3s infinite linear .6s}.wind-west.wind-med .small.weather-3{animation:falling-3-west-med 3s infinite linear .6s}.wind-west.wind-high .small.weather-3{animation:falling-3-west-high 3s infinite linear .6s}.small.weather-4{animation:falling-4 2.9s infinite linear 1.1s}.wind-east .small.weather-4{animation:falling-4-east 2.9s infinite linear 1.1s}.wind-east.wind-med .small.weather-4{animation:falling-4-east-med 2.9s infinite linear 1.1s}.wind-east.wind-high .small.weather-4{animation:falling-4-east-high 2.9s infinite linear 1.1s}.wind-west .small.weather-4{animation:falling-4-west 2.9s infinite linear 1.1s}.wind-west.wind-med .small.weather-4{animation:falling-4-west-med 2.9s infinite linear 1.1s}.wind-west.wind-high .small.weather-4{animation:falling-4-west-high 2.9s infinite linear 1.1s}.small.weather-5{animation:falling-5 2.8s infinite linear .9s}.wind-east .small.weather-5{animation:falling-5-east 2.8s infinite linear .9s}.wind-east.wind-med .small.weather-5{animation:falling-5-east-med 2.8s infinite linear .9s}.wind-east.wind-high .small.weather-5{animation:falling-5-east-high 2.8s infinite linear .9s}.wind-west .small.weather-5{animation:falling-5-west 2.8s infinite linear .9s}.wind-west.wind-med .small.weather-5{animation:falling-5-west-med 2.8s infinite linear .9s}.wind-west.wind-high .small.weather-5{animation:falling-5-west-high 2.8s infinite linear .9s}.small.weather-6{animation:falling-6 2.1s infinite linear 1.4s}.wind-east .small.weather-6{animation:falling-6-east 2.1s infinite linear 1.4s}.wind-east.wind-med .small.weather-6{animation:falling-6-east-med 2.1s infinite linear 1.4s}.wind-east.wind-high .small.weather-6{animation:falling-6-east-high 2.1s infinite linear 1.4s}.wind-west .small.weather-6{animation:falling-6-west 2.1s infinite linear 1.4s}.wind-west.wind-med .small.weather-6{animation:falling-6-west-med 2.1s infinite linear 1.4s}.wind-west.wind-high .small.weather-6{animation:falling-6-west-high 2.1s infinite linear 1.4s}.small.weather-7{animation:falling-7 1.1s infinite linear .8s}.wind-east .small.weather-7{animation:falling-7-east 1.1s infinite linear .8s}.wind-east.wind-med .small.weather-7{animation:falling-7-east-med 1.1s infinite linear .8s}.wind-east.wind-high .small.weather-7{animation:falling-7-east-high 1.1s infinite linear .8s}.wind-west .small.weather-7{animation:falling-7-west 1.1s infinite linear .8s}.wind-west.wind-med .small.weather-7{animation:falling-7-west-med 1.1s infinite linear .8s}.wind-west.wind-high .small.weather-7{animation:falling-7-west-high 1.1s infinite linear .8s}.small.weather-8{animation:falling-8 1.6s infinite linear .5s}.wind-east .small.weather-8{animation:falling-8-east 1.6s infinite linear .5s}.wind-east.wind-med .small.weather-8{animation:falling-8-east-med 1.6s infinite linear .5s}.wind-east.wind-high .small.weather-8{animation:falling-8-east-high 1.6s infinite linear .5s}.wind-west .small.weather-8{animation:falling-8-west 1.6s infinite linear .5s}.wind-west.wind-med .small.weather-8{animation:falling-8-west-med 1.6s infinite linear .5s}.wind-west.wind-high .small.weather-8{animation:falling-8-west-high 1.6s infinite linear .5s}.small.weather-9{animation:falling-9 2.9s infinite linear .5s}.wind-east .small.weather-9{animation:falling-9-east 2.9s infinite linear .5s}.wind-east.wind-med .small.weather-9{animation:falling-9-east-med 2.9s infinite linear .5s}.wind-east.wind-high .small.weather-9{animation:falling-9-east-high 2.9s infinite linear .5s}.wind-west .small.weather-9{animation:falling-9-west 2.9s infinite linear .5s}.wind-west.wind-med .small.weather-9{animation:falling-9-west-med 2.9s infinite linear .5s}.wind-west.wind-high .small.weather-9{animation:falling-9-west-high 2.9s infinite linear .5s}.small.weather-10{animation:falling-10 3s infinite linear 1.2s}.wind-east .small.weather-10{animation:falling-10-east 3s infinite linear 1.2s}.wind-east.wind-med .small.weather-10{animation:falling-10-east-med 3s infinite linear 1.2s}.wind-east.wind-high .small.weather-10{animation:falling-10-east-high 3s infinite linear 1.2s}.wind-west .small.weather-10{animation:falling-10-west 3s infinite linear 1.2s}.wind-west.wind-med .small.weather-10{animation:falling-10-west-med 3s infinite linear 1.2s}.wind-west.wind-high .small.weather-10{animation:falling-10-west-high 3s infinite linear 1.2s}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        25: [
            function(require, module, exports) {
                var css =
                    '.snow .weather{z-index:6;position:absolute;top:calc(var(--frame-width) / -1);opacity:0;height:300%;width:120%;left:36.36364px;left:72.72727px;left:109.09091px;left:145.45455px;left:181.81818px;left:218.18182px;left:254.54545px;left:290.90909px;left:327.27273px;left:363.63636px}@keyframes falling-1{25%{opacity:.1;left:16.36364px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:-3.63636px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:36.36364px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:56.36364px}}@keyframes falling-2{25%{opacity:.1;left:52.72727px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:32.72727px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:72.72727px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:92.72727px}}@keyframes falling-3{25%{opacity:.1;left:89.09091px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:69.09091px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:109.09091px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:129.09091px}}@keyframes falling-4{25%{opacity:.1;left:125.45455px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:105.45455px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:145.45455px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:165.45455px}}@keyframes falling-5{25%{opacity:.1;left:161.81818px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:141.81818px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:181.81818px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:201.81818px}}@keyframes falling-6{25%{opacity:.1;left:198.18182px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:178.18182px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:218.18182px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:238.18182px}}@keyframes falling-7{25%{opacity:.1;left:234.54545px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:214.54545px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:254.54545px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:274.54545px}}@keyframes falling-8{25%{opacity:.1;left:270.90909px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:250.90909px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:290.90909px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:310.90909px}}@keyframes falling-9{25%{opacity:.1;left:307.27273px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:287.27273px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:327.27273px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:347.27273px}}@keyframes falling-10{25%{opacity:.1;left:343.63636px;top:calc(var(--weather-height) * .2)}50%{opacity:.4;left:323.63636px;top:calc(var(--weather-height) * .5)}75%{opacity:.4;left:363.63636px;top:calc(var(--weather-height) * .8)}100%{opacity:.4;top:calc(var(--weather-height) * 1.1);left:383.63636px}}.snow .weather.tiny{background-image:radial-gradient(#fff 4%, transparent 0);background-size:40px 30px;background-position:0 0, 10px 10px}.snow .weather.small{background-image:radial-gradient(#fff 3%, transparent 0);background-size:50px 38px;background-position:0 0, 10px 10px}.snow .weather.large{background-image:radial-gradient(#fff 2.5%, transparent 0);background-size:60px 45px;background-position:0 0, 10px 10px}.tiny.weather-1{animation:falling-1 3.1s infinite linear 3.2s}.tiny.weather-2{animation:falling-2 5.6s infinite linear 1.2s}.tiny.weather-3{animation:falling-3 6.8s infinite linear .9s}.tiny.weather-4{animation:falling-4 6.9s infinite linear 2.9s}.tiny.weather-5{animation:falling-5 4.4s infinite linear 1.9s}.tiny.weather-6{animation:falling-6 3.8s infinite linear 3.2s}.tiny.weather-7{animation:falling-7 4.9s infinite linear 3.4s}.tiny.weather-8{animation:falling-8 5.4s infinite linear 2.7s}.tiny.weather-9{animation:falling-9 7s infinite linear 1.7s}.tiny.weather-10{animation:falling-10 3.7s infinite linear 3.1s}.small.weather-1{animation:falling-1 5.1s infinite linear .1s}.small.weather-2{animation:falling-2 6.5s infinite linear 4s}.small.weather-3{animation:falling-3 5.1s infinite linear 1.8s}.small.weather-4{animation:falling-4 3.8s infinite linear 2.3s}.small.weather-5{animation:falling-5 6.7s infinite linear 3.2s}.small.weather-6{animation:falling-6 3.3s infinite linear 1.7s}.small.weather-7{animation:falling-7 5.4s infinite linear .1s}.small.weather-8{animation:falling-8 5.5s infinite linear 3s}.small.weather-9{animation:falling-9 6.5s infinite linear 1.8s}.small.weather-10{animation:falling-10 3.5s infinite linear 1.7s}.large.weather-1{animation:falling-1 5.6s infinite linear 3.2s}.large.weather-2{animation:falling-2 4.8s infinite linear 3.5s}.large.weather-3{animation:falling-3 5.3s infinite linear 2.4s}.large.weather-4{animation:falling-4 5.1s infinite linear 1.2s}.large.weather-5{animation:falling-5 5.6s infinite linear 2.9s}.large.weather-6{animation:falling-6 4.4s infinite linear 2.4s}.large.weather-7{animation:falling-7 4.3s infinite linear 3.2s}.large.weather-8{animation:falling-8 6.7s infinite linear 3.6s}.large.weather-9{animation:falling-9 4.6s infinite linear 1s}.large.weather-10{animation:falling-10 3.2s infinite linear 3.8s}\n'
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        26: [
            function(require, module, exports) {
                var css =
                    "#sun,#moon{z-index:2;position:absolute;top:var(--light-position);left:var(--light-position);height:var(--light-size);width:var(--light-size);border-radius:50%;transform:rotate(5deg)}#weather.night #sun{visibility:hidden}#weather:not(.night) #moon{top:var(--light-position);left:calc(100% - 2 * var(--light-position));transform:scale(0.3) rotate(5deg);box-shadow:0 0 0 0;opacity:.5}#sun{background:linear-gradient(#ff0, #fc0);box-shadow:0 0 10px orange}#moon{background:#334;box-shadow:0 0 10px 1px #aaa;overflow:hidden;visibility:hidden}#moon.visible{visibility:visible}.light-overlay{position:absolute;z-index:2;top:-1px;left:-1px;height:calc(var(--light-size) + 2px);width:calc(var(--light-size) + 2px);border-radius:50%;background:rgba(235,235,255,0.8)}.new .light-overlay{visibility:hidden}.half .light-overlay{height:calc(3 * var(--light-size));top:calc(-1 * var(--light-size));width:calc(1.2 * var(--light-size))}.right.half .light-overlay{left:calc(.45 * var(--light-size))}.left.half .light-overlay{left:calc(-.65 * var(--light-size))}.gibbous .light-overlay{height:calc(1.2 * var(--light-size));top:calc(-.1 * var(--light-size))}.gibbous.left .light-overlay{left:calc(-.25 * var(--light-size))}.gibbous.right .light-overlay{left:calc(.25 * var(--light-size))}.crescent .light-overlay{border-radius:0}.crescent .light-overlay:after{content:'';position:absolute;z-index:2;top:calc(-.1 * var(--light-size));height:calc(1.2 * var(--light-size));width:var(--light-size);border-radius:50%;background:rgba(50,50,70,0.8)}.crescent.right .light-overlay:after{left:calc(-.25 * var(--light-size))}.crescent.left .light-overlay:after{left:calc(.25 * var(--light-size))}.dots{position:relative;z-index:1;border-radius:50%;height:100%;width:100%}.dot{background:#001;position:absolute;height:5px;width:5px;border-radius:50%}.dot.one{height:7px;width:7px;top:10px;left:16px}.dot.two{top:40px;left:56px}.dot.three{top:20px;left:16px}.dot.four{height:7px;width:7px;top:50px;left:18px}.dot.five{height:7px;width:7px;top:50px;left:36px}.dot.six{height:10px;width:13px;top:23px;left:42px}.dot.seven{height:10px;width:10px;top:53px;left:20px}\n"
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        27: [
            function(require, module, exports) {
                var css =
                    ".cloud:after,.puff:after{content:'';left:var(--wind-frame-size);visibility:visible}.wind-west .cloud:after,.wind-west .puff:after{left:calc(-1 * var(--wind-frame-size))}.wind-low.wind-east .cloud,.wind-low.wind-east .puff{animation:eastWind 60s infinite linear}.wind-low.wind-east.mist .cloud,.wind-low.wind-east.mist .puff{animation:eastWindMist 60s infinite linear}.wind-low.wind-east.smoke .cloud,.wind-low.wind-east.smoke .puff{animation:eastWindSmoke 60s infinite linear}.wind-low.wind-west .cloud,.wind-low.wind-west .puff{animation:westWind 60s infinite linear}.wind-low.wind-west.mist .cloud,.wind-low.wind-west.mist .puff{animation:westWindMist 60s infinite linear}.wind-low.wind-west.smoke .cloud,.wind-low.wind-west.smoke .puff{animation:westWindSmoke 60s infinite linear}.wind-med.wind-east .cloud,.wind-med.wind-east .puff{animation:eastWind 40s infinite linear}.wind-med.wind-east.mist .cloud,.wind-med.wind-east.mist .puff{animation:eastWindMist 40s infinite linear}.wind-med.wind-east.smoke .cloud,.wind-med.wind-east.smoke .puff{animation:eastWindSmoke 40s infinite linear}.wind-med.wind-west .cloud,.wind-med.wind-west .puff{animation:westWind 40s infinite linear}.wind-med.wind-west.mist .cloud,.wind-med.wind-west.mist .puff{animation:westWindMist 40s infinite linear}.wind-med.wind-west.smoke .cloud,.wind-med.wind-west.smoke .puff{animation:westWindSmoke 40s infinite linear}.wind-high.wind-east .cloud,.wind-high.wind-east .puff{animation:eastWind 20s infinite linear}.wind-high.wind-east.mist .cloud,.wind-high.wind-east.mist .puff{animation:eastWindMist 20s infinite linear}.wind-high.wind-east.smoke .cloud,.wind-high.wind-east.smoke .puff{animation:eastWindSmoke 20s infinite linear}.wind-high.wind-west .cloud,.wind-high.wind-west .puff{animation:westWind 20s infinite linear}.wind-high.wind-west.mist .cloud,.wind-high.wind-west.mist .puff{animation:westWindMist 20s infinite linear}.wind-high.wind-west.smoke .cloud,.wind-high.wind-west.smoke .puff{animation:westWindSmoke 20s infinite linear}@keyframes eastWind{100%{transform:translateX(calc(-1 * var(--wind-frame-size)))}}@keyframes westWind{100%{transform:translateX(var(--wind-frame-size))}}@keyframes eastWindMist{100%{transform:translateX(calc(-1 * var(--wind-frame-size))) translateY(140px) scaleY(0.4)}}@keyframes westWindMist{100%{transform:translateX(var(--wind-frame-size)) translateY(140px) scaleY(0.4)}}@keyframes eastWindSmoke{100%{transform:translateX(calc(-1 * var(--wind-frame-size))) translateX(-80px) translateY(30px) scaleY(2.5)}}@keyframes westWindSmoke{100%{transform:translateX(var(--wind-frame-size)) translateX(-80px) translateY(30px) scaleY(2.5)}}\n"
                module.exports = require('scssify').createStyle(css, {})
            },
            { scssify: 1 },
        ],
        28: [
            function(require, module, exports) {
                function addClass(element, newClass) {
                    element.classList.add(newClass)
                }

                module.exports = addClass
            },
            {},
        ],
        29: [
            function(require, module, exports) {
                const CARDINAL_WIND_DIRECTIONS = [
                    'N',
                    'NNE',
                    'NE',
                    'ENE',
                    'E',
                    'ESE',
                    'SE',
                    'SSE',
                    'S',
                    'SSW',
                    'SW',
                    'WSW',
                    'W',
                    'WNW',
                    'NW',
                    'NNW',
                ]
                function getCardinalWindDirection(degrees) {
                    let cardinal = Math.floor(degrees / 22.5 + 0.5)
                    return CARDINAL_WIND_DIRECTIONS[cardinal % 16]
                }

                module.exports = getCardinalWindDirection
            },
            {},
        ],
        30: [
            function(require, module, exports) {
                const weather = require('./weatherTypes')

                function getWeatherClassName(weatherCode) {
                    // https://openweathermap.org/weather-conditions
                    if (weatherCode >= 801 || weatherCode == 771) return { baseWeatherType: weather.clouds }
                    if (weatherCode == 701 || weatherCode == 721 || weatherCode == 741)
                        return { baseWeatherType: weather.mist }
                    if (weatherCode >= 711 && weatherCode <= 762) return { baseWeatherType: weather.smoke }
                    if (weatherCode == 800 || weatherCode > 762) return { baseWeatherType: weather.clear }
                    if (weatherCode >= 600) return { baseWeatherType: weather.snow }
                    if (weatherCode >= 500)
                        return {
                            baseWeatherType: weather.rain,
                            weatherModifier: weather.severity.medium,
                        } // 500s rain incl light
                    if (weatherCode >= 300)
                        return {
                            baseWeatherType: weather.rain,
                            weatherModifier: weather.severity.light,
                        } // drizzle
                    if (weatherCode >= 200)
                        return {
                            baseWeatherType: weather.storm,
                            weatherModifier: weather.severity.heavy,
                        }

                    throw new Error('unrecognized weather code!')
                }

                module.exports = getWeatherClassName
            },
            { './weatherTypes': 33 },
        ],
        31: [
            function(require, module, exports) {
                /**
                 * given a unix datetime & UTC offset (in seconds),
                 * returns a flag indicating whether the great wheel is currently open.
                 * aka-- whether it should be spinning and lit up or an unmoving grey blob.
                 */
                function isGreatWheelOpen(apiDateTime, offset) {
                    // get hour from apiDateTime
                    // - the open weather map API returns unix datetimes, which are in seconds.
                    // - js time is stored in milliseconds-- hence multiply by 1000 here.
                    let date = new Date(apiDateTime * 1000)
                    let hour = date.getUTCHours() // eg, 23

                    // handle for offset
                    hour += 24 // +24 to handle for negative
                    offset = offset / 60 / 60
                    hour += offset
                    hour = hour % 24 // reset value to normal hour value

                    // mock business hours
                    return hour >= 10 && hour <= 23
                }

                module.exports = isGreatWheelOpen
            },
            {},
        ],
        32: [
            function(require, module, exports) {
                const addClass = require('./addClass')

                const moduleLoadTime = Date.now()
                const minLoadTimeInMs = 500

                function removeLoadingPanel() {
                    let next = () => {
                        addClass(document.getElementById('loading'), 'loaded')
                    }
                    let msSinceModuleLoad = Date.now() - moduleLoadTime
                    if (msSinceModuleLoad >= minLoadTimeInMs) {
                        next()
                    } else {
                        setTimeout(next, minLoadTimeInMs - msSinceModuleLoad)
                    }
                }

                let loadedModules = { weather: false, moon: false }

                function reportModuleLoaded(moduleName) {
                    loadedModules[moduleName] = true

                    if (loadedModules.weather && loadedModules.moon) {
                        removeLoadingPanel()
                    }
                }

                module.exports = reportModuleLoaded
            },
            { './addClass': 28 },
        ],
        33: [
            function(require, module, exports) {
                let supportedWeather = {
                    clear: 'clear',
                    clouds: 'clouds',
                    storm: 'storm',
                    mist: 'mist',
                    night: 'night',
                    rain: 'rain',
                    smoke: 'smoke',
                    snow: 'snow',
                    wind: 'wind',
                }

                let rainyTypes = [supportedWeather.rain, supportedWeather.snow, supportedWeather.storm]

                let cloudyTypes = [
                    supportedWeather.clouds,
                    supportedWeather.mist,
                    supportedWeather.smoke,
                    supportedWeather.storm,
                    ...rainyTypes,
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

                module.exports = weather
            },
            {},
        ],
    },
    {},
    [9]
)
