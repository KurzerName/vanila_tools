/**
 * Модуль слушателя изменений DOM
 * В случае чего - можно изменить таргеты, конфиги и callback функцию
 *
 * @return {}
 */
const fixedIntervalObserverModule = function () {
    let observer = new MutationObserver(() =>{});

    let configuration = {
        childList: true,
        subtree: true
    };

    let target = {};

    /**
     * Метод установки нового таргета
     *
     * @param targetElement
     */
    const setTarget = (targetElement = null) => {
        target = targetElement ?? document;

        observer.observe(target, configuration)
    }

    /**
     * Метод переопределения слушателя
     *
     * @param callbackFn
     * @param params
     */
    const setMutation = (callbackFn) => {
        observer = new MutationObserver(callbackFn);

        setTarget(target);
    }

    /**
     * Метод переопределения конфигурации
     */
    const setConfig = (newConfig = null) => {
        configuration = newConfig ?? {
            childList : true,
            subtree   : true,
        };
    }

    /**
     * Метод отключения слушателя
     */
    const disconnect = () => {
        observer.disconnect();
    }

    setTarget();

    return {
        setTarget   : (targetElement) => setTarget(targetElement),
        setMutation : (callbackFn) => setMutation(callbackFn),
        setConfig   : (configuration) => setConfig(configuration),
        disconnect  : () => disconnect(),
    };
}();

(function ()  {
    let fixedElements   = Array.from(document.querySelectorAll('.fixed_interval'));
    let arrayElements   = [];
    let scrolledY       = 0;

    setPropertiesForFixedElements(fixedElements);

    window.addEventListener('scroll', e => moveFixedInterval(e))

    /**
     * Метод перемещения блоков
     *
     * @param e
     */
    function moveFixedInterval(e) {
        console.log('Я сработал')
        scrolledY = e.path[1].scrollY

        let elementsMatch   = [];
        let noElementsMatch = [];

        arrayElements.forEach(element => {
            if (element.interval(scrolledY)) {
                elementsMatch.push(element);

                return;
            }

            noElementsMatch.push(element);
        })

        elementsMatch.forEach((element) => {
            let currentElement = element.element;
            let positionLeft   = currentElement.offsetLeft;

            currentElement.style.top       = element.offsetTop - currentElement.getStart + 'px';
            currentElement.style.position  = 'fixed';
            currentElement.style.transform = 'none';
            currentElement.style.left      = positionLeft + 'px';
        })

        noElementsMatch.forEach(({element}) => {
            element.style.position = 'relative';
            element.style.left     = 'auto';
            element.style.top      = 'auto';

            if (scrolledY >= element.getAbsoluteDownX) {
                element.style.transform = `translateY(${element.getDown + 'px'})`;
            } else {
                element.style.transform = `translateY(0px)`;
            }
        })
    }

    /**
     * Метод добавления свойств элементам для интервальной фиксации
     *
     * @param elements
     */
    function setPropertiesForFixedElements(elements) {
        elements.forEach(element => {
            if (element.isChanged) {
                return;
            }

            Object.defineProperties(element, {
                /**
                 * Метод получения координат для начала интервального фиксирования
                 */
                'getStart': {
                    get() {
                        let dataStart = element.dataset.fixedStart;

                        if (!dataStart) {
                            console.error('Вы не задали позицию начала перемещения элемента (нужен аттрибут data-fixed-start)');

                            return 0;
                        }

                        return Number(dataStart);
                    },

                    configurable: false
                },

                /**
                 * Метод получения числа, на которое мы опустим блок
                 */
                'getDown': {
                    get() {
                        let dataDown = element.dataset.fixedDown;

                        if (!dataDown) {
                            console.error('Вы не задали позицию конца перемещения элемента (нужен аттрибут data-fixed-down) для элемента:');
                            console.error(element);

                            return 0;
                        }

                        return Number(dataDown);
                    },

                    configurable: false
                },

                /**
                 * Метод получения позиции, где он окажется в самом конце по оси X
                 */
                'getAbsoluteDownX': {
                    get() {
                        return this.getStart + this.getDown;
                    },

                    configurable: false
                },

                /**
                 * Метод, который показывает, прошёл ли элемент процесс добавления нового свойства
                 */
                'isChanged': {
                    get() {
                        return true;
                    },

                    configurable: false
                },
            })

            arrayElements.push({
                interval      : (scrolledY) => scrolledY >= element.getStart && scrolledY <= element.getAbsoluteDownX,
                offsetTop     : element.offsetTop,
                offsetLeft    : element.offsetLeft,
                element,
            });
        })
    }

    /**
     * Переопределили поведение слушателя при мутации
     */
    fixedIntervalObserverModule.setMutation((mutations) => {
        mutations.forEach(mutation => {
            let {addedNodes, removedNodes} = mutation;

            if (addedNodes.length) {
                let newFixedElements = [];

                addedNodes.forEach(element => {
                    if (element?.classList?.contains('fixed_interval')) {
                        newFixedElements.push(element);
                    }
                })

                if (!newFixedElements.length) {
                    return;
                }

                fixedElements = fixedElements.concat(newFixedElements);

                setPropertiesForFixedElements(fixedElements);
            }

            if (removedNodes.length) {
                let deletedFixedElements = [];

                removedNodes.forEach(element => {
                    if (element?.classList?.contains('fixed_interval')) {
                        deletedFixedElements.push(element);
                    }
                })

                if (!deletedFixedElements.length) {
                    return;
                }

                fixedElements = fixedElements.filter(element => deletedFixedElements.some(deletedElement => deletedElement !== element));
                arrayElements = arrayElements.filter(({element}) => deletedFixedElements.some(deletedElement => deletedElement !== element));
            }
        })
    })
})()