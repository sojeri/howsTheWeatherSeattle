const addClass = require('./addClass');

function addClouds(weatherElement) {
    addClass(weatherElement, 'clouds');
    require('./clouds.scss');
}

module.exports = addClouds;