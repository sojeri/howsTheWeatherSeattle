require('./view/styles/index.scss')
const loadWeather = require('./data/loadWeather')
const loadMoon = require('./data/loadMoon')

// handle custom locations

loadWeather()
loadMoon()
