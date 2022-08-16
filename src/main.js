const zoomLevels = {
    '0.5x': { width: 810, height: 80, indicatorDiameter: 10 },
    '0.75x': { width: 1080, height: 120, indicatorDiameter: 15 },
    '1x': { width: 1350, height: 160, indicatorDiameter: 20 },
    '1.25x': { width: 1620, height: 200, indicatorDiameter: 25 },
    '1.5x': { width: 1890, height: 240, indicatorDiameter: 30 },
};
let currentZoom = '1x';
let noteMode = 'chord';
const neck = document.querySelector('.neck');
let selectedNotes = [];
let savedSequence = [];
let sequenceName = '';
let chordInputFontSize = 10;

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
                <input type='checkbox' id="row_${i}_col_${j}" row="${i}" col="${j}">\n
                <label for="row_${i}_col_${j}" class='block' row="${i}" col="${j}" style='width: 8px; background-color: black'>\n
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
                } else dotHTML = '';
                //main blocks
                fretboardHTML += `
                <input type='checkbox' id="row_${i}_col_${j}" row="${i}" col="${j}" >\n
                <label for="row_${i}_col_${j}" class='block' row="${i}" col="${j}" style='width: ${width}px'>\n
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
        const stringThickness = parseFloat(currentZoom)*3
        stringHTML += `<div class='string no_${6 - i}' style='border-width:${stringThickness}px'></div>\n`;
    }
    fretboardWrapper.innerHTML += fretboardHTML;
    neck.innerHTML += stringHTML;
    document.querySelectorAll('.block').forEach(dom => dom.onclick = (e) => {
        if(e.target.tagName != 'LABEL') {
            noteClicked(e.target.parentNode);
            console.log(e.target.parentNode);
        } else {
            noteClicked(e.target);
            console.log(e.target);
        }
    })


    //set size of head
    const guitarHead = document.querySelector('.guitar_head');
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
    //initial x-scroll position to the most right of fretboard plus 50px(to show nut to click open string)
    document.querySelector('.lower_side').scrollLeft =
        neckCanvas.offsetWidth -
        window.innerWidth -
        guitarHead.offsetWidth +
        50;
}

init();

//sequence name input font size adjustment
const sequenceNameInput = document.querySelector('input#sequence_name');
sequenceNameInput.onkeydown = () => { inputTextResize(sequenceNameInput)}
function inputTextResize(dom) {
    console.log(dom.scrollWidth, dom.clientWidth);
    while(dom.scrollWidth > dom.clientWidth){
        chordInputFontSize--;
            dom.style.fontSize = chordInputFontSize + 'vh';
            console.log(dom.scrollWidth, dom.clientWidth);
    } 
}
//reset notes button setup
const resetButton = document.querySelector('.reset');
resetButton.onclick = () => {
    clearFretboard();
    selectedNotes = [];
};

function clearFretboard() {
    const allInputs = document.querySelectorAll('input[type=checkbox]');
    allInputs.forEach((e) => {
        e.checked = false;
        const indic = e.nextElementSibling.querySelector('.indicator');
        indic.innerText = '';
        indic.classList.remove('transparent');
    });
}

//save sequence button setup
const saveButton = document.querySelector('button.save');
saveButton.onclick = () => {
    if(noteMode == 'chord') {
        //for chord, examine all inputs to filter selected ones, and add them to selectedNotes
        const allInputs = document.querySelectorAll('input[type=checkbox]:checked');
        allInputs.forEach(e => {
            const { row, col, noteName } = selectedNoteParser(e);
            selectedNotes.push([row, col, noteName]);
        })
    }
    sequenceName = sequenceNameInput.value;
    if(!selectedNotes[0]) {
        window.alert('no notes selected');
        return;
    }
    saveSequence();
    clearFretboard();
    selectedNotes = [];
    sequenceNameInput.value = '';
};

//delete all sequences button
const deleteButton = document.querySelector('button.delete');
deleteButton.onclick = () => {
    document.querySelector('.saved_sequences').innerHTML = '';
    savedSequence = [];
};


function noteClicked(clickedLabelTag) {
    const { row, col, noteName } = selectedNoteParser(clickedLabelTag);
    linkedInputTag = clickedLabelTag.parentNode.querySelector(`input[row='${row}'][col='${col}']`);
    noteNameAnimation(noteName, clickedLabelTag);
    if (noteMode == 'chord') {
        //if chord mode, prevent two or more notes on same string, remove it from recorded notes
        clickedLabelTag.parentNode.querySelectorAll('input').forEach((e) => {
            if (e != linkedInputTag && e.checked) {
                e.checked = false;
            }
        });
        //for chord mode, collect selected notes later when save button is hit
    }
    if (noteMode == 'line') {
        //if line mode, save selected note right away
        selectedNotes.push([row, col, noteName]);
        //if line mode, execute line sequence handler
        noteNumberer(clickedLabelTag, row, col, noteName);
        //allow duplicate of notes (make it rechecked)
        setTimeout(()=> {
            if(!linkedInputTag.checked) linkedInputTag.checked = true;
        },0);
    }
}

function selectedNoteParser(dom) {
    const row = dom.getAttribute('row');
    const col = dom.getAttribute('col');
    const noteName = matrix[row][col];
    return { row, col, noteName };
}

function noteNameAnimation(noteName, clickedLabelTag) {
    const div = document.createElement('div');
    div.innerText = noteName;
    div.classList.add('note_name', 'emerge');
    const indicatorPos = parseInt(clickedLabelTag.lastElementChild.style.left);
    div.style = 'left:' + indicatorPos + 'px';
    clickedLabelTag.append(div);
    div.onanimationend = () => {
        div.remove();
    };
}

function noteNumberer(dom, row, col, noteName) {
    const noteNum = selectedNotes.length;
    // past indicators show sequence number and appear transparent
    dom.querySelector('.indicator').classList.add('transparent');
    dom.querySelector('.indicator').innerText = noteNum;
}

function saveSequence() {
    savedSequence.push({
        type: noteMode,
        sequence: selectedNotes,
        sequenceName: sequenceName ?? null
    });
    const sequenceNum = savedSequence.length;
    //create new div for saved sequence
    const seq = document.createElement('div');
    seq.innerText = `sequence ${sequenceNum}: ${sequenceName ? sequenceName : noteMode == 'line' ? 'line' :  'chord'}`;
    seq.classList.add('sequence', 'tile');
    seq.setAttribute('sequence_no', sequenceNum);
    document.querySelector('.saved_sequences').append(seq);
    seq.onclick = () => {
        replaySequence(sequenceNum);
    };
}

function replaySequence(sequenceNum) {
    console.log(
        `sequence ${sequenceNum}: ${savedSequence[sequenceNum - 1].sequence.map(
            (e) => e[2]
        )}`,
        `type: ${savedSequence[sequenceNum - 1].type}`
    );
    const veil = document.querySelector('.veil');
    clearFretboard();
    selectedNotes = [];
    if(noteMode == 'chord') displayChord();
    else displayLine();
    

    function displayChord() {
        veil.classList.add('show')
        const sequence = savedSequence[sequenceNum - 1].sequence;
        for(i=0; i<sequence.length; i++){
            document.querySelector(`input#row_${sequence[i][0]}_col_${sequence[i][1]}`).click();
        }
        sequenceNameInput.value = savedSequence[sequenceNum - 1].sequenceName;
        setTimeout(clickToContinue, 0);
    }

    function displayLine() {
        veil.classList.add('show')
        const playbackInterval = 500;
        const sequence = savedSequence[sequenceNum - 1].sequence;
        let i = 0;
        sequenceNameInput.value = savedSequence[sequenceNum - 1].sequenceName;
        const intervalID = setInterval(()=>{
            if(i == sequence.length) {
                // selectedNotes = [];
                // clearFretboard();
                clearInterval(intervalID);
                clickToContinue();
                // sequenceNameInput.value = '';
                return;
            }
            document.querySelector(`label[row='${sequence[i][0]}'][col='${sequence[i][1]}']`).click();
            i++;
        }, playbackInterval);
    }

    function clickToContinue(){
        veil.innerText = 'click anywhere to continue';
        window.onclick = () =>{
            selectedNotes = [];
            clearFretboard();
            sequenceNameInput.value = '';
            window.onclick = null;
            veil.innerText = '';
            veil.classList.remove('show')
            }
    }
}


//zoom levels
function toggle(dom) {
    Array.from(dom.parentNode.children).forEach((e) => {
        e.classList.remove('selected');
    });
    dom.classList.add('selected');
    //note mode toggle
    if (dom.classList.contains('chord_line_mode')) {
        noteMode = dom.getAttribute('mode');
        clearFretboard();
    }
    //zoom mode toggle
    if (dom.classList.contains('zoom_mode')) {
        currentZoom = dom.innerText;
        init();
    }
}


//save & download screenshot
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
