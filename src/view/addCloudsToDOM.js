const addClass = require('./addClass');

function addClouds(weatherElement) {
    addClass(weatherElement, 'clouds');
    require('./styles/clouds.scss');
}

module.exports = addClouds;