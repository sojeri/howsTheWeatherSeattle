const CARDINAL_WIND_DIRECTIONS = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function convertWindDegreesToCardinal(degrees) {
    let cardinal = Math.floor((degrees/22.5) + 0.5);
    return CARDINAL_WIND_DIRECTIONS[cardinal % 16];
}

module.exports = convertWindDegreesToCardinal;