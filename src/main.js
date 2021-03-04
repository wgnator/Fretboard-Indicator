const zoomLevels = {
    '0.5x': { width: 810, height: 80, indicatorDiameter: 10 },
    '0.75x': { width: 1080, height: 120, indicatorDiameter: 15 },
    '1x': { width: 1350, height: 160, indicatorDiameter: 20 },
    '1.25x': { width: 1620, height: 200, indicatorDiameter: 25 },
    '1.5x': { width: 1890, height: 240, indicatorDiameter: 30 },
};
let currentZoom = '1x';
let currentStickMode = true;
const neck = document.querySelector('.neck');

function init() {
    let fretboardHTML = '';
    let stringHTML = '';
    let dotHTML = '';
    let fretboardLength;
    const dotPositions = [3, 5, 7, 9, 12, 15, 17, 19, 21];
    const zoomSetting = zoomLevels[currentZoom];
    const neckCanvas = document.querySelector('.neck_canvas');
    neck.innerHTML = '';
    neck.innerHTML += `<div class="fretboard_wrapper"></div>`;
    const fretboardWrapper = document.querySelector('.fretboard_wrapper');
    fretboardLength = zoomSetting.width;
    neck.style.width = zoomSetting.width + 'px';
    neck.style.height = zoomSetting.height + 'px';
    neckCanvas.style.width = fretboardLength + 500 + 'px';
    indicatorDiameter = zoomSetting.indicatorDiameter;
    //create blocks & strings
    for (i = 0; i < 6; i++) {
        fretboardHTML += `<div class='row no_${i}'>\n`;

        for (j = 0; j <= 24; j++) {
            //setup for open string position
            if (j == 0) {
                fretboardHTML += `
                <input type='checkbox' id="row_${i}_col_${j}">\n
                <label for="row_${i}_col_${j}" class='block row_${i} col_${j}' row="${i}" col="${j}" style='width: 8px; background-color: black' onclick='noteClicked(this)'>\n
                <div class='indicator' style='left: ${
                    indicatorDiameter / 2
                }px; width: ${indicatorDiameter}px; height: ${indicatorDiameter}px;'>\n
                </div>\n
                </label>\n`;
            } else {
                //for all else
                let width = fretboardLength * 0.07757 * 0.94 ** (j - 1);

                //create neck number & inlays
                if (i == 0 && dotPositions.includes(j)) {
                    dotHTML = `<div class='fret_number'>${j}</div>\n<div class='dot'></div>\n`;
                    // } else if (i == 3 && dot.includes(j)) {
                    //     ;
                } else dotHTML = '';
                //main blocks
                fretboardHTML += `
                <input type='checkbox' id="row_${i}_col_${j}" >\n
                <label for="row_${i}_col_${j}" class='block row_${i} col_${j}' row="${i}" col="${j}" style='width: ${width}px' onclick='noteClicked(this)'>\n
                ${dotHTML}
                    <div class='indicator' style='left: ${
                        width / 2 - 10
                    }px; width: ${indicatorDiameter}px; height: ${indicatorDiameter}px; top: calc(50% - ${
                    indicatorDiameter / 2
                }px)'>\n
                    </div>\n
                </label>\n`;
            }
        }

        fretboardHTML += '</div>\n';
        //create strings
        stringHTML += `<div class='string no_${6 - i}'></div>\n`;
    }
    fretboardWrapper.innerHTML += fretboardHTML;
    neck.innerHTML += stringHTML;
    const guitarHead = document.querySelector('.guitar_head');
    //set size of head
    guitarHead.style.height = zoomSetting.height * 2.3625 + 'px';
    guitarHead.style.width = `${zoomSetting.height * 2.3625 * 2.2068}px`;
    //set styles of dot inlay
    const dotSize = zoomSetting.indicatorDiameter / 2;
    document.querySelectorAll('.dot').forEach((e) => {
        e.style.cssText = `width: ${dotSize}px;
        height: ${dotSize}px;
        top: calc(300% - ${dotSize / 2}px);
        left: calc(50% - ${dotSize / 2}px);`;
    });
    document.querySelectorAll('.fret_number').forEach((e) => {
        e.style.fontSize = parseFloat(currentZoom) + 'rem';
    });
    //initial x-scroll position to the most right
    document.querySelector('.lower_side').scrollLeft =
        neckCanvas.offsetWidth -
        window.innerWidth -
        guitarHead.offsetWidth +
        15;
}

init();

//reset button
let allInputs = document.querySelectorAll('input');
const resetButton = document.querySelector('.reset');

resetButton.onclick = () => {
    allInputs.forEach((elem) => {
        if (elem.type == 'checkbox') elem.checked = false;
    });
};

function noteClicked(dom) {
    const row = dom.getAttribute('row');
    const col = dom.getAttribute('col');
    //create note name animation
    const div = document.createElement('div');
    div.innerText = matrix[row][col];
    div.classList.add('note_name', 'emerge');
    const indicatorPos = parseInt(dom.lastElementChild.style.left);
    div.style = 'left:' + indicatorPos + 'px';
    dom.append(div);
    div.onanimationend = () => {
        div.remove();
    };

    //prevent two or more notes on same string
    dom.parentNode.querySelectorAll('input').forEach((e) => {
        if (e != dom && e.checked) e.checked = false;
    });

    //if stick mode is off, input tag is never checked
    setTimeout(() => {
        if (!currentStickMode) {
            dom.parentNode.querySelector(
                `input#row_${row}_col_${col}`
            ).checked = false;
            console.log(
                dom.parentNode.querySelector(`input#row_${row}_col_${col}`)
            );
        }
    }, 0);
}

//zoom levels
function toggle(dom) {
    Array.from(dom.parentNode.children).forEach((e) => {
        e.classList.remove('selected');
    });
    dom.classList.add('selected');

    if (dom.classList.contains('stick_mode')) {
        currentStickMode = Boolean(dom.getAttribute('stick'));
        if (!currentStickMode)
            document.querySelectorAll('input').forEach((e) => {
                e.checked = false;
            });
    }

    if (dom.classList.contains('zoom_mode')) {
        currentZoom = dom.innerText;
        init();
    }
}

//download screenshot

function saveScreenshot() {
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    html2canvas(document.querySelector('body')).then((canvas) => {
        canvas.toBlob((blob) => {
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    });
}
