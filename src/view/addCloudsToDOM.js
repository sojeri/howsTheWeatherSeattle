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
