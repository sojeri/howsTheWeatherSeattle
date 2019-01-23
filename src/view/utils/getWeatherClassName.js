function getWeatherClassName(weatherCode) {
    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 801 || weatherCode == 771) return { baseWeatherType: 'clouds', };
    if (weatherCode == 701 || weatherCode == 741) return { baseWeatherType: 'mist', };
    if (weatherCode >= 711 && weatherCode <= 762) return { baseWeatherType: 'smoke', };
    if (weatherCode == 800 || weatherCode > 762) return { baseWeatherType: 'clear', };
    if (weatherCode >= 600) return { baseWeatherType: 'snow', };
    if (weatherCode >= 500) return { baseWeatherType: 'rain', weatherModifier: 'medium', }; // 500s rain incl light
    if (weatherCode >= 300) return { baseWeatherType: 'rain', weatherModifier: 'light', }; // drizzle
    if (weatherCode >= 200) return { baseWeatherType: 'thunder', weatherModifier: 'heavy' };
    
    throw new Error('unrecognized weather code!');
}

module.exports = getWeatherClassName;