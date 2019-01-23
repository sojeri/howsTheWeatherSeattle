const SEATTLE_LAT = '47.5922116';
const SEATTLE_LONG = '-122.3205388';

// https://openweathermap.org/current
const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LONG}&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d`;
const FALLBACK_WEATHER = {
    weather: [{ id: 501 }],
    wind: { speed: 10, deg: 90 },
    main: {
        humidity: 84,
        temp: 52,
        temp_min: 39,
        temp_max: 61,
    },
    sys: { sunrise: 1, sunset: 3, },
    dt: 2,
};

// https://solunar.org/#usage
const REPLACE = '@@REPLACE@@';
const MOON_ENDPOINT = `https://api.solunar.org/solunar/${SEATTLE_LAT},${SEATTLE_LONG},${REPLACE},-7`
const FALLBACK_MOON = { phase: { trend: 'waning', shape: 'gibbous', }};

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    REPLACE,
    MOON_ENDPOINT,
    FALLBACK_MOON,
}
