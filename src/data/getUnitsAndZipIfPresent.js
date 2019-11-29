function getUnitsAndZipIfPresent() {
    const urlParams = getUrlParams()
    if (urlParams) {
        let zip = getZipIfPresent(urlParams)
        zip = zip == undefined ? '98108' : zip

        let units = getUnitsIfPresent(urlParams)
        units = units == 'metric' ? 'metric' : 'imperial'

        return { zip: zip, units: units }
    }
}

function getUrlParams() {
    let urlParts = window.location.href.split('?')
    if (urlParts.length > 1) {
        urlParts = urlParts[1].split('&')
        
        if (urlParts.length > 0) {
            let params = {}
    
            urlParts.forEach(unit => {
                keyValues = unit.split('=') // eg, zip=98116
                params[keyValues[0]] = keyValues[1] // eg params.zip = 98116
            })
    
            return params
        }
    }

}

function getZipIfPresent(params) {
    if (params.zip && params.zip.length >= 5) {
        return params.zip
    }
}

function getUnitsIfPresent(params) {
    if (params.units) {
        if (params.units == 'metric' || params.units == 'imperial') {
            return params.units
        }
    }
}


module.exports = getUnitsAndZipIfPresent