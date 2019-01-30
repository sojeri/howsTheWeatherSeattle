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
        case weather.storm:
            require('./styles/cloud-like-weather/lightning.scss');
        case weather.clouds:
            require('./styles/cloud-like-weather/clouds.scss');
            break;
    }
}

module.exports = addCloudLikeWeather;