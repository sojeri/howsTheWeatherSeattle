let supportedWeather = {
    clear: 1,
    clouds: 2,
    lightning: 3,
    mist: 4,
    night: 5,
    rain: 6,
    smoke: 7,
    snow: 8,
    wind: 9,
}

let rainyTypes = [
    supportedWeather.rain,
    supportedWeather.snow,
    supportedWeather.lightning
]

let cloudyTypes = [
    supportedWeather.cloudyTypes,
    supportedWeather.mist,
    supportedWeather.smoke,
    supportedWeather.lightning
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