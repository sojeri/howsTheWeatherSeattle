const { subscribe, unsubscribe, getRandomIdentifier } = require('../data/DOMutils')
const logError = require('../data/utils/logError')

const SELF_CLOSING_ELEMENTS = {
    area: 1,
    base: 1,
    br: 1,
    col: 1,
    command: 1,
    embed: 1,
    hr: 1,
    img: 1,
    input: 1,
    keygen: 1,
    link: 1,
    meta: 1,
    param: 1,
    source: 1,
    track: 1,
    wbr: 1,
}

function canElementHaveContent(element) {
    return SELF_CLOSING_ELEMENTS[element] !== 1
}

function createElement({ elementType, content }) {
    if (typeof elementType !== 'string') {
        logError('Tried to call createElement() without required param elementType.')
        return null
    }

    var element = document.createElement(elementType)

    if (content && canElementHaveContent(elementType)) {
        element.innerHTML = content
    }

    return element
}

function createElementWithAttributes({ elementType, attributes, content }) {
    var element = createElement({ elementType, content })
    if (!attributes) return element

    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key])
    })

    return element
}

function addAboutLinksToDOM() {
    var outerDiv = createElementWithAttributes({
        elementType: 'div',
        attributes: { id: 'about-links', style: 'display: none;' },
    })

    var projectLink = createElementWithAttributes({
        elementType: 'a',
        attributes: {
            href: 'https://github.com/sojeri/howsTheWeatherSeattle',
            title: 'about this weather widget',
        },
        content: 'about widget',
    })

    var landingPageLink = createElementWithAttributes({
        elementType: 'a',
        attributes: { href: 'https://sojeri.github.io/', title: 'Go back to landing page' },
        content: 'landing page',
    })

    outerDiv.appendChild(projectLink)
    outerDiv.appendChild(landingPageLink)

    var theBody = document.getElementsByTagName('body')[0]

    theBody.appendChild(outerDiv)

    // set timeout for displaying about links-- 3 seconds sounds good
    setTimeout(displayAboutLinks, 3000)
}

function displayAboutLinks() {
    // grab about links from page
    var aboutLinks = document.getElementById('about-links')

    // remove style preventing them from display
    aboutLinks.setAttribute('style', '')
}

function addAboutToDOM() {
    require('./styles/about.scss')

    const subscribeId = getRandomIdentifier()
    subscribe(
        'DOMContentLoaded',
        () => {
            addAboutLinksToDOM()
            unsubscribe('DOMContentLoaded', subscribeId)
        },
        subscribeId
    )
}

module.exports = addAboutToDOM
