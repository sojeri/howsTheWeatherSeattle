function addRainToDOM(rainLevel) {
    console.log(rainLevel);
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