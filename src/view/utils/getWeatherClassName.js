function getWeatherClassName(weatherCode) {
    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 801 || weatherCode == 771) return 'clouds';
    if (weatherCode == 701 || weatherCode == 741) return 'mist';
    if (weatherCode >= 711 && weatherCode <= 762) return 'smoke';
    if (weatherCode == 800 || weatherCode > 762) return 'clear';
    if (weatherCode >= 600) return 'snow';
    if (weatherCode >= 300) return 'rain'; // 300s drizzle 500s rain incl light
    if (weatherCode >= 200) return 'thunder';
    
    throw new Error('unrecognized weather code!');
}

module.exports = getWeatherClassName;