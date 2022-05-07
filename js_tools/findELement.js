/**
 * Скрипт для поиска элемента по его селектору
 *
 */

/**
 * Метод поиска элемента по его селектору
 *
 * @param element
 * @param selector
 */
function findChildELementBySelector(element, selector) {
    let row           = 0;
    let stop          = 0;
    let column        = 0;
    let columnUpValue = 0;
    let find          = false;
    let children      = element.children;
    let child         = [];

    // checkElementRow(children, children.length)

    while (true) {
        stop++;

        if (stop === 10) {
            break;
        }

        // if (checkElementRow(children, selector)) {
        //     return 1111;
        // }

        console.log(children)

        if (!children.length) {
            row++;

            if (row >= child.parentElement.children.length) {
                row = 0;
            }

            let newBranch = child.parentElement.children[row]?.children;

            console.log(child.parentElement?.lastElementChild)

            if (child.parentElement?.lastElementChild === child) {
                newBranch = child.parentElement.parentElement.children;

                columnUpValue++;
            }

            if (!newBranch.length) {
                newBranch = takeParentWithMoreChildren(child);
            }

            children = newBranch;
            column++;

            continue;
        }

        if (column >= children.length) {
            column = columnUpValue;
        }

        child    = children[column];
        children = children[column].children;

        column++;
    }
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
    let iteration     = 0;
    let maxIteration  = 50;
    let attributes    = getAttributesAndValuesFromQuery(query);
    let selectors     = getSelectorsFromQuery(query);
    let hasAttributes = Object.values(attributes).length > 0;
    let hasSelectors  = Object.values(selectors).length > 0;

    let isMatch = false;

    while (true) {
        if (iteration >= maxIteration) {
            return  null;
        }

        if (!element) {
            return null;
        }

        isMatch = checkElementForSelectors(element, selectors)

        if (hasAttributes) {
            isMatch = checkElementForAttributes(element, attributes)
        }

        if (isMatch) {
            return element;
        }

        element = element.parentElement;
        maxIteration++;
    }
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
    let tag           = getSelectorId.length > 1 ? getSelectorId[0] : '';
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

    if (selectors.tag !== '') {
        isMatch = element.tagName === selectors.tag.toUpperCase();
    }

    if (selectors.id !== '') {
        isMatch = element.getAttribute('id') === selectors.id;
    }

    if (selectors.classes.length !== 0) {
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

function checkElementRow(elements, selector) {
    let result = false;

    Array.from(elements).forEach(element => {
        // console.log(element)
        //
        if (element.getAttribute('id') === selector) {
            result = element;
        }
    })

    // console.log(result)
    return result;
}

function takeParentWithMoreChildren(element) {
    let result = element;

    while (true) {
        if (result.children.length <= 1) {
            result = result.parentElement;

            continue;
        }

        return result.children;
    }
}