require('./view/styles/index.scss')

const loadWeather = require('./data/loadWeather')
const loadMoon = require('./data/loadMoon')
const loadAqi = require('./data/loadAqi')
const loadUvIndex = require('./data/loadUvIndex')
const addAboutToDOM = require('./view/addAboutToDOM')

loadWeather()
loadMoon()
loadAqi()
loadUvIndex()
addAboutToDOM()
