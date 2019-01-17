const addClass = require('./addClass');

function addMoonToDOM(moonBlob, eventName, eventHandlerLookup) {
    if (eventName && eventHandlerLookup) unsubscribe(eventName, eventHandlerLookup);

    let phase = moonBlob[0].Phase;
    let shapeClass, lightStartClass;
    switch (phase) {
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

    console.log(phase);
}

module.exports = addMoonToDOM;