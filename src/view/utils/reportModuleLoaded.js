const addClass = require('./addClass')

const moduleLoadTime = Date.now()
const minLoadTimeInMs = 500

function removeLoadingPanel() {
    let next = () => {
        addClass(document.getElementById('loading'), 'loaded')
    }
    let msSinceModuleLoad = Date.now() - moduleLoadTime
    if (msSinceModuleLoad >= minLoadTimeInMs) {
        next()
    } else {
        setTimeout(next, minLoadTimeInMs - msSinceModuleLoad)
    }
}

let loadedModules = { weather: false, moon: false }

function reportModuleLoaded(moduleName) {
    loadedModules[moduleName] = true

    if (loadedModules.weather && loadedModules.moon && loadedModules.aqi && loadedModules.uv) {
        removeLoadingPanel()
    }
}

module.exports = reportModuleLoaded
