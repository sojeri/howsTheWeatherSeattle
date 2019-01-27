const weather = require('./weatherTypes');

function getWeatherClassName(weatherCode) {
    // return { baseWeatherType: 'thunder', weatherModifier: 'heavy' };

    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 801 || weatherCode == 771) return { baseWeatherType: weather.clouds, };
    if (weatherCode == 701 || weatherCode == 741) return { baseWeatherType: weather.mist, };
    if (weatherCode >= 711 && weatherCode <= 762) return { baseWeatherType: weather.smoke, };
    if (weatherCode == 800 || weatherCode > 762) return { baseWeatherType: weather.clear, };
    if (weatherCode >= 600) return { baseWeatherType: weather.snow, };
    if (weatherCode >= 500) return { baseWeatherType: weather.rain, weatherModifier: weather.severity.medium, }; // 500s rain incl light
    if (weatherCode >= 300) return { baseWeatherType: weather.rain, weatherModifier: weather.severity.light, }; // drizzle
    if (weatherCode >= 200) return { baseWeatherType: weather.lightning, weatherModifier: weather.severity.heavy };
    
    throw new Error('unrecognized weather code!');
}

module.exports = getWeatherClassName;