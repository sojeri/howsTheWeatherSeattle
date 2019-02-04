let supportedWeather = {
    clear: 'clear',
    clouds: 'clouds',
    storm: 'storm',
    mist: 'mist',
    night: 'night',
    rain: 'rain',
    smoke: 'smoke',
    snow: 'snow',
    wind: 'wind',
}

let rainyTypes = [
    supportedWeather.rain,
    supportedWeather.snow,
    supportedWeather.storm
]

let cloudyTypes = [
    supportedWeather.clouds,
    supportedWeather.mist,
    supportedWeather.smoke,
    supportedWeather.storm,
    ...rainyTypes
]

let severity = {
    light: 1,
    medium: 2,
    heavy: 3,
}

const weather = {
    ...supportedWeather,
    severity: severity,
    isRainy: t => rainyTypes.includes(t),
    isCloudy: t => cloudyTypes.includes(t),
}

module.exports = weather;