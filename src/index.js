const loadWeather = require('./data/fetchAndUpdateWeather');
const loadMoon = require('./data/fetchAndUpdateMoon');

loadWeather();
loadMoon(Math.floor(Date.now() / 1000));