const addClass = require('./addClass');

function addRainToDOM(weatherElement, rainLevel) {
    addClass(weatherElement, 'isFalling');

    switch (rainLevel) {
        case 'medium':
            require('./styles/mediumFalling.scss');
            break;
        case 'heavy':
            require('./styles/heavyFalling.scss');
            break;
        case 'light':
        default:
            require('./styles/lightFalling.scss');
            break;
    }
}

module.exports = addRainToDOM;