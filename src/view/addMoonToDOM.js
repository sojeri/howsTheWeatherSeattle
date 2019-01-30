const addClass = require('./addClass');

const convertStringNumberToNumber = sn => Number(sn);

// FIXME: this logic may be broken. verify API returns always: current moon rise & set always in that order
//        (eg, never previously set at 04:30 and back up at 21:00 when current time is 16:00 same day)
function isMoonVisible(moonRiseTime, moonSetTime) {
    let time = new Date(Date.now());
    let currentHour = time.getUTCHours() - 7;
    if (currentHour < 1) currentHour += 24;
    const currentMin = time.getUTCMinutes();
    
    let [riseHour, riseMin] = moonRiseTime.split(':').map(convertStringNumberToNumber);
    let [setHour, setMin] = moonSetTime.split(':').map(convertStringNumberToNumber);

    if (currentHour < riseHour) currentHour += 24;
    if (setHour < riseHour) setHour += 24;

    if (riseHour < currentHour && currentHour < setHour) return true;
    if (riseHour == currentHour && riseMin <= currentMin) return true;
    if (setHour == currentHour && currentMin <= setMin) return true;

    return false;
}

const phases = {
    new: { shapeClass: 'new', },
    waxingCrescent: { shapeClass: 'crescent', lightStartClass: 'right', },
    firstQuarter: { shapeClass: 'half', lightStartClass: 'right', },
    waxingGibbous: { shapeClass: 'gibbous', lightStartClass: 'right', },
    full: { shapeClass: 'full', },
    waningGibbous: { shapeClass: 'gibbous', lightStartClass: 'left', },
    thirdQuarter: { shapeClass: 'half', lightStartClass: 'left', },
    waningCrescent: { shapeClass: 'crescent', lightStartClass: 'left', },
}

function getPhase(blob) {
    switch (blob.moonPhase) {
        case 'Waxing Crescent':
            return blob.moonIllumination < .10 ? phases.new : phases.waxingCrescent;
        case 'First Quarter':
            return blob.moonIllumination < .35 ? phases.waxingCrescent : phases.firstQuarter;
        case 'Waxing Gibbous':
            return blob.moonIllumination < .60 ? phases.firstQuarter : phases.waxingGibbous;
        case 'Full Moon':
            return blob.moonIllumination < .85 ? phases.waxingGibbous : phases.full;
        case 'Waning Gibbous':
            return blob.moonIllumination > .90 ? phases.full : phases.waningGibbous;
        case 'Third Quarter':
            return blob.moonIllumination > .65 ? phases.waningGibbous : phases.thirdQuarter;
        case 'Waning Crescent':
            return blob.moonIllumination > .40 ? phases.thirdQuarter : phases.waningCrescent;
        case 'New Moon':
            return blob.moonIllumination > .15 ? phases.waningCrescent : phases.new;
        default:
            throw new Error('unrecognized moon phase');
    }
}

function addMoonToDOM(moonBlob) {
    
    if (isMoonVisible(moonBlob.moonRise, moonBlob.moonSet)) {
        let moonElement = document.getElementById('moon');
        addClass(moonElement, 'visible');

        let { shapeClass, lightStartClass } = getPhase(moonBlob);
        addClass(moonElement, shapeClass);
        if (lightStartClass) addClass(moonElement, lightStartClass);
    }

}

module.exports = addMoonToDOM;