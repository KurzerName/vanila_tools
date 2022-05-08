/**
 * Скрипт для поиска элемента по его селектору
 */

/**
 * Метод поиска дочернего элемента по его селектору
 *
 * @param element
 * @param query
 *
 * @return {HTMLElement | null}
 */
function findChildElementBySelector(element, query) {
    const allChildrenElements = element.getElementsByTagName('*');
    const attributes          = getAttributesAndValuesFromQuery(query);
    const selectors           = getSelectorsFromQuery(query);
    const hasAttributes       = Object.values(attributes).length > 0;
    let isMatch               = false;

    for (child of allChildrenElements) {
        isMatch = checkElementForSelectors(child, selectors)

        if (hasAttributes) {
            isMatch = checkElementForAttributes(child, attributes)
        }

        if (isMatch) {
            return child;
        }
    }

    return null;
}

/**
 * Метод поиска родительского элемента по его селектору
 *
 * @param element
 * @param query
 *
 * @return {HTMLElement | null}
 */
function findParentElementBySelector(element, query) {
    const attributes    = getAttributesAndValuesFromQuery(query);
    const selectors     = getSelectorsFromQuery(query);
    const hasAttributes = Object.values(attributes).length > 0;
    let isMatch         = false;

    while (element) {
        isMatch = checkElementForSelectors(element, selectors)

        if (hasAttributes) {
            isMatch = checkElementForAttributes(element, attributes)
        }

        if (isMatch) {
            return element;
        }

        element = element.parentElement;
    }

    return null;
}

/**
 * Метод получения атрибутов и их значений из запроса
 * selector[data-test="name"] =>
 *  {
 *      data-test: 'name'
 *  }
 *
 * @param selector
 *
 * @return {{}}
 */
function getAttributesAndValuesFromQuery(selector) {
    let parseQuery = selector.split('[');

    if (parseQuery.length === 1) {
        return {};
    }

    let preparedParseQuery = {};

    parseQuery.forEach(selector => {
        let attributeAndValue = selector.split('=');

        if (attributeAndValue.length <= 1) {
            return;
        }

        preparedParseQuery[attributeAndValue[0]] = attributeAndValue[1].split('.')[0].replaceAll(/[\]'"]/g,'');
    })

    return preparedParseQuery;
}

/**
 * Метод получения всех селекторов
 *
 * @param query
 *
 * @return {{}}
 */
function getSelectorsFromQuery(query) {
    let prepareQuery = query;
    prepareQuery     = prepareQuery.replaceAll(/\[(.*?)\]/g, ''); // удаляем все доа атрибуты (Всё что в [])

    let getSelectorId = prepareQuery.split('#');
    let tag           = getSelectorId.length > 1 ? (getSelectorId[0] === '' ? null : '') : '';
    let id            = getSelectorId.length > 1 ? getSelectorId[1].split('.')[0] : '';
    let classes       = [];

    prepareQuery.split('.').forEach((selector, index) => {
        if (index === 0 && tag === '') {
            tag = selector;

            return;
        }

        if (selector.includes('#')) {
            return;
        }

        classes.push(selector);
    })

    return {
        tag,
        classes,
        id
    }
}

/**
 * Метод проверки элемента по аттрибутам
 *
 * @param element
 * @param attributes
 *
 * @return {boolean}
 */
function checkElementForAttributes(element, attributes) {
    let isMatch = false;

    for(let attributeKey in attributes) {
        if (element.getAttribute(attributeKey) === attributes[attributeKey]) {
            isMatch = true;

            break;
        }
    }

    return isMatch;
}

/**
 * Метод проверки элемента по селекторам
 *
 * @param element
 * @param selectors
 *
 * @return {boolean}
 */
function checkElementForSelectors(element, selectors) {
    let isMatch = false;

    if (selectors.tag) {
        isMatch = element.tagName === selectors.tag.toUpperCase();
    }

    if (selectors.id) {
        isMatch = element.getAttribute('id') === selectors.id;
    }

    if (selectors.classes.length) {
        for (className of selectors.classes) {
            if (!element.classList.contains(className)) {
                isMatch = false;

                break;
            }

            isMatch = true;
        }
    }

    return isMatch;
}