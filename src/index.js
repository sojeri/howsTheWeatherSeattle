require('./view/styles/index.scss')

const loadWeather = require('./data/loadWeather')
const loadMoon = require('./data/loadMoon')
const addAboutToDOM = require('./view/addAboutToDOM')

loadWeather()
loadMoon()
addAboutToDOM()
