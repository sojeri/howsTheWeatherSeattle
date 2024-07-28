const reportModuleLoaded = require('./utils/reportModuleLoaded')

function getUvIndexDescription(uv) {
    if (uv >= 11) return 'Extreme'
    if (uv >= 8) return 'Very high'
    if (uv >= 6) return 'High'
    if (uv >= 3) return 'Moderate'
    return 'Low'
}

function addUvIndexToDOM(blob) {
    const uv = blob.result?.uv
    const displayUv = Math.round(uv)
    const description = getUvIndexDescription(uv)

    // hide UV index if display value doesn't make sense
    if (Number.isNaN(displayUv)) {
        document.getElementById('uv').classList.add('hidden')
    } else {
        document.getElementById('uv-value').innerHTML = displayUv
        document.getElementById('uv-description').innerHTML = description
    }

    reportModuleLoaded('uv')
}

module.exports = addUvIndexToDOM
