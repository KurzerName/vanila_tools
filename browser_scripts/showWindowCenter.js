function showWindowCenter() {
    let width = window.innerWidth;
    let div   = document.getElementById('show-window-center-div');

    if (div) {
        div.remove();
    }

    div = document.createElement('div');
    div.setAttribute('id', 'show-window-center-div');
    div.style.cssText = `
            background-color: red;
            width: 1px;
            height: 100vh;
            left: ${width / 2}px;
            position: fixed;
            z-index: 1000000000000000000000000;
            bottom: 0;
`;

    document.body.appendChild(div);
}