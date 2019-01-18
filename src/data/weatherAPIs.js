const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather?id=5809844&units=imperial&appid=231512774f62e8fcb7d1a19af041b94d';
const FALLBACK_WEATHER = {
    weather: { id: 501 },
    wind: { speed: 10, deg: 90 },
    main: {
        humidity: 87,
        temp: 12,
        temp_min: 9,
        temp_max: 21,
    },
    sys: { sunrise: 1, sunset: 3, },
    dt: 2,
};
/**
 * good response
 * {
 *   "coord": {"lon":-0.13,"lat":51.51},
 *   "weather":[{"id":300,"main":"Drizzle","description":"light intensity drizzle","icon":"09d"}],
 *   "base":"stations",
 *   "main":{
 *      "temp":32.94,
 *      "pressure":1012,
 *      "humidity":81,
 *      "temp_min":24.8,
 *      "temp_max":42.98},
 *   "visibility":10000,
 *   "wind":{"speed":4.1,"deg":80},
 *   "clouds":{"all":90},
 *   "dt":1485789600,
 *   "sys":{"type":1,"id":5091,"message":0.0103,"country":"GB","sunrise":1485762037,"sunset":1485794875},
 *   "id":2643743,
 *   "name":"London",
 *   "cod":200
 * }
 * 
 * bad response:
 * {
 *   "cod":401,
 *   "message": "Invalid API key. Please see http://openweathermap.org/faq#error401 for more info."
 * }
 */

const MOON_ENDPOINT = 'http://api.farmsense.net/v1/moonphases/?d=';
const FALLBACK_MOON = [{ Phase: 'Waxing Crescent' }];

module.exports = {
    WEATHER_ENDPOINT,
    FALLBACK_WEATHER,
    MOON_ENDPOINT,
    FALLBACK_MOON,
}