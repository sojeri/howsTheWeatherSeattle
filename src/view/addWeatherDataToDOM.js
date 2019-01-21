function addWeatherDataToDOM(blob) {
    const humidity = blob.humidity;
    const temp = blob.temp;
    const minTemp = blob.temp_min;
    const maxTemp = blob.temp_max;
    
    document.getElementById('humidity').innerHTML = humidity;
    document.getElementById('temp').innerHTML = temp;
    
    // these properties are not guaranteed to be always returned by the API
    if (minTemp && maxTemp) {
        document.getElementById('temp-min').innerHTML = minTemp;
        document.getElementById('temp-max').innerHTML = maxTemp;
    } else {
        document.getElementById('min-max').classList.add('hidden');
    }
}

module.exports = addWeatherDataToDOM;