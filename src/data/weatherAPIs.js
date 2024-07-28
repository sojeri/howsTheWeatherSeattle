const SEATTLE_LAT = '47.5922116'
const SEATTLE_LONG = '-122.3205388'
const OWM_APPID = '231512774f62e8fcb7d1a19af041b94d'

// https://openweathermap.org/current
const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&units=imperial&appid=${OWM_APPID}`
const FALLBACK_WEATHER = {
    weather: [{ id: 601 }],
    wind: { speed: 25, deg: 90 },
    main: {
        humidity: 84,
        temp: 52,
        temp_min: 39,
        temp_max: 61,
    },
    sys: { sunrise: 1, sunset: 3 },
    dt: 4,
}

function getWeatherUrl(zip, units, country) {
    return `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&units=${units}&appid=${OWM_APPID}`
}

// https://solunar.org/#usage
const REPLACE = '@@REPLACE@@'
const MOON_ENDPOINT = `https://api.solunar.org/solunar/${SEATTLE_LAT},${SEATTLE_LONG},${REPLACE},-7`
const FALLBACK_MOON = {
    moonPhase: 'Waning Gibbous',
    moonRise: '01:04',
    moonSet: '16:53',
}

function getMoonUrl(lat, long) {
    return `https://api.solunar.org/solunar/${lat},${long},${REPLACE},-7`
}

// https://openweathermap.org/api/air-pollution
const AQI_ENDPOINT = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&appid=${OWM_APPID}`
const FALLBACK_AQI = { list: [{ main: { aqi: 1 } }] }

function getAqiUrl(lat, long) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${OWM_APPID}`
}

// https://www.openuv.io/
const UV_INDEX_ENDPOINT = `https://api.openuv.io/api/v1/uv?lat=${SEATTLE_LAT}&lng=${SEATTLE_LONG}`
const FALLBACK_UV_INDEX = { uv: 1 }

function getUvIndexUrl(lat, long) {
    return `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${long}`
}

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    REPLACE,
    MOON_ENDPOINT,
    FALLBACK_MOON,
    AQI_ENDPOINT,
    FALLBACK_AQI,
    UV_INDEX_ENDPOINT,
    FALLBACK_UV_INDEX,
    getWeatherUrl,
    getMoonUrl,
    getAqiUrl,
    getUvIndexUrl,
}
