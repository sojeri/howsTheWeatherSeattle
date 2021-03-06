const SEATTLE_LAT = '47.5922116'
const SEATTLE_LONG = '-122.3205388'

// https://openweathermap.org/current
const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d`
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
    return `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&units=${units}&appid=231512774f62e8fcb7d1a19af041b94d`
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

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    REPLACE,
    MOON_ENDPOINT,
    FALLBACK_MOON,
    getWeatherUrl,
    getMoonUrl,
}
