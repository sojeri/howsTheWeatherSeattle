function getCustomParams() {
    const urlParams = getUrlParams()
    if (urlParams) {
        let zip = getZipIfPresent(urlParams)
        zip = zip == undefined ? '98108' : zip

        let units = getUnitsIfPresent(urlParams)
        units = units == 'metric' ? 'metric' : 'imperial'

        let country = getCountryIfPresent(urlParams)
        country = country ? country : 'us'

        return {
            zip: zip,
            units: units,
            country: country,
        }
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
    if (params.zip) {
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

function getCountryIfPresent(params) {
    if (params.country) {
        return params.country
    }
}

module.exports = getCustomParams
