/*
 * Puzzle Game
 *
 * IxD HT25
 * A3: Functional Prototype
 * 
 */

// Only show the solved indicator when it has been randomized
let solvedByUser = false;
// Stop counting moves when it gets solved
let puzzleSolved = false;


// Colors
const colors = {
  scheme1: {
    c1: "#33A6B8",
    c2: "#FB9966",
    c3: "#FFFFFF",
    solved: "#A7C080",
    text: "#FFFFFF"
  },
  scheme2: {
    c1: "#F5ECC2",
    c2: "#F3A257",
    c3: "#B09F36",
    solved: "#B09F36",
    text: "#F5ECC2"
  }, 
  scheme3: {
    c1: "#FDD4BD",
    c2: "#B2B73E",
    c3: "#B4CDC2",
    solved: "#B2B73E",
    text: "#FFE5D7"
  }, 
  scheme4: {
    c1: "#F37F94",
    c2: "#FDD4BD",
    c3: "#AFD472",
    solved: "#AFD472",
    text: "#FFE7D9"
  }
};

const cSchemesAmount = Object.keys(colors).length;
let cSchemesIndex = 1;

let currentColors = colors.scheme1;
let prevColors;


// Keys
const keyPress = {
  up: {
    press: false, 
    left: false, 
    right: false
  },
  down: {
    press: false, 
    left: false, 
    right: false
  },
  left: {
    press: false, 
    up: false, 
    down: false
  },
  right: {
    press: false, 
    up: false, 
    down: false
  },
  center: {
    press: false,
    up: false, 
    down: false,
    left: false, 
    right: false
  }
};

/** keys[x][y] */
const keys = [
  ["KeyQ", "KeyA", "KeyZ"],
  ["KeyW", "KeyS", "KeyX"],
  ["KeyE", "KeyD", "KeyC"]
];

/** keyRowsMap[y][x] */
const keyRowsMap = [
  ["Digit6", "Digit7", "Digit8", "Digit9"],
  ["KeyY", "KeyU", "KeyI", "KeyO"],
  ["KeyH", "KeyJ", "KeyK", "KeyL"],
  ["KeyN", "KeyM", "Comma", "Period"]
];

const keyRows = {
  r1: {
    press: false,
    havePressed: false,
    time: null
  },
  r2: {
    press: false,
    havePressed: false,
    time: null
  },
  r3: {
    press: false,
    havePressed: false,
    time: null
  },
  r4: {
    press: false,
    havePressed: false,
    time: null
  }
};

const keyRowsAmount = Object.keys(keyRows).length;
const swipeRowsTimeLimit = 200;
let haveSwiped = false;

const randomizeKey = "Space";
let randomize = false;

const resetKey = "Enter";
let resetCube = false;


// Cubes
let cubeObjects = {};
/** cubes[x][y] */
let cubes = [];

const cubeSize = 70;
const cubeSizeGap = 8;
const cubeSizeMarginX = 170;
const cubeSizeMarginY = 100;

const wholeCubeWidth = 3 * cubeSize + 2 * cubeSizeGap;


// Indicators
const indicators = {};
const indicatorSize = cubeSize * 0.4;
const indicatorMargin = cubeSize * 1.05;

const indicatorSolvedSize = cubeSize * 0.22; 
const indicatorSolvedMargin = cubeSize * 0.3; 


// Text
const textSize = cubeSize / 2;


// Timer
const timeText = document.getElementById("time");
const timeTextXPos = cubeSizeMarginX + wholeCubeWidth;
const timeTextYPos = cubeSizeMarginY + wholeCubeWidth + cubeSize * 0.5;

let time = "0.00";
let timerRunning;

let timeStart;
let timeElapsed;

let hideTimer = false;
let hideTimerKey = "t";


// Moves
const movesText = document.getElementById("moves");
const movesTextOffset = cubeSize / 2 + cubeSize * 0.15;

let movesTotal = 0;
let hideMoves = false;
let hideMovesKey = "v";


// Code that runs over and over again
function loop() {
  checkRowSwipe();

  if (haveSwiped) {
    changeColorScheme();
    haveSwiped = false;
  }

  moveColors();
  drawCubes();

  if (resetCube) {
    resetColors();
    solvedByUser = false;
    timerRunning = false;
    time = "0.00";
    movesTotal = 0;
    puzzleSolved = false;

    resetCube = false;
  }

  if (randomize) {
    randomizeColors(50);
    solvedByUser = true;
    timeStart = performance.now();
    timerRunning = true;
    movesTotal = 0;
    puzzleSolved = false;

    randomize = false;
  }

  if (timerRunning) {
    timeElapsed = performance.now() - timeStart;
    time = (timeElapsed / 1000).toFixed(2);
  }

  checkIfSolved();
  drawTimeText();
  drawMovesText();
  drawIndicatorSolved();

  window.requestAnimationFrame(loop);
}

/** Change `haveSwiped` to true if the time between the row presses is low enough. The variable `swipeRowsTimeLimit` changes the time limit between two row presses */
function checkRowSwipe() {
  getKeyRowsTime();

  const row1Row2 = checkTimeDiff(keyRows.r1, keyRows.r2);
  const row2Row3 = checkTimeDiff(keyRows.r2, keyRows.r3);
  const row3Row4 = checkTimeDiff(keyRows.r3, keyRows.r4);

  if (row1Row2 && row2Row3 || row2Row3 && row3Row4) {
    haveSwiped = true;

    // Remove the saved time for when the keys were pressed
    for (let i = 1; i <= keyRowsAmount; i++) {
      keyRows[`r${i}`].time = null;
    }
  }
}

function getKeyRowsTime() {
  for (let i = 1; i <= keyRowsAmount; i++) {
    const row = `r${i}`;

    if (keyRows[row].press) {
      if (!keyRows[row].havePressed) {
        keyRows[row].time = performance.now();
        keyRows[row].havePressed = true; // `keyUp` event make it false again
      }
    }
  }
}

function checkTimeDiff(row1, row2) {
  if (row2.time - row1.time < swipeRowsTimeLimit && 
      row2.time - row1.time > 0) {
    return true;
  } else {
    return false;
  }
}

function changeColorScheme() {
  prevColors = currentColors;

  if (cSchemesIndex < cSchemesAmount) {
    cSchemesIndex++;
  } else if (cSchemesIndex === cSchemesAmount) {
    cSchemesIndex = 1;
  }

  currentColors = colors[`scheme${cSchemesIndex}`];

  // Cubes
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (cubes[x][y].color === prevColors.c1) {
        cubes[x][y].color = currentColors.c1;
      } else if (cubes[x][y].color === prevColors.c2) {
        cubes[x][y].color = currentColors.c2;
      } else if (cubes[x][y].color === prevColors.c3) {
        cubes[x][y].color = currentColors.c3;
      }
    }
  }

  // Indicators
  indicators.r1.el.style.backgroundColor = currentColors.c1;
  indicators.r2.el.style.backgroundColor = currentColors.c2;
  indicators.r3.el.style.backgroundColor = currentColors.c3;
}

/** Take in the keyboard input to move the colors of the cube objects. One keypress moves the colors of one row or column one step */
function moveColors() {
  // Up
  if (keyPress.up.left) {
    move(2, 0, 1, 0, 0, 0);
    keyPress.up.left = false;
  } else if (keyPress.up.right) {
    move(0, 0, 1, 0, 2, 0);
    keyPress.up.right = false;
  }
  
  // Down
  if (keyPress.down.left) {
    move(2, 2, 1, 2, 0, 2);
    keyPress.down.left = false;
  } else if (keyPress.down.right) {
    move(0, 2, 1, 2, 2, 2);
    keyPress.down.right = false;
  }

  // Left
  if (keyPress.left.up) {
    move(0, 2, 0, 1, 0, 0);
    keyPress.left.up = false;
  } else if (keyPress.left.down) {
    move(0, 0, 0, 1, 0, 2);
    keyPress.left.down = false;
  }

  // Right
  if (keyPress.right.up) {
    move(2, 2, 2, 1, 2, 0);
    keyPress.right.up = false;
  } else if (keyPress.right.down) {
    move(2, 0, 2, 1, 2, 2);
    keyPress.right.down = false;
  }

  // Center
  if (keyPress.center.up) {
    move(1, 2, 1, 1, 1, 0);
    keyPress.center.up = false;
  } else if (keyPress.center.down) {
    move(1, 0, 1, 1, 1, 2);
    keyPress.center.down = false;
  } else if (keyPress.center.left) {
    move(2, 1, 1, 1, 0, 1);
    keyPress.center.left = false;
  } else if (keyPress.center.right) {
    move(0, 1, 1, 1, 2, 1);
    keyPress.center.right = false;
  }
}

/**
 * Take in three cube positions and switch the colors of them by pushing each one step to the right, so 1, 2, 3 will switch to 3, 1, 2
 * @param {number} x1 - Position 1
 * @param {number} y1 - Position 1
 * @param {number} x2 - Position 2
 * @param {number} y2 - Position 2
 * @param {number} x3 - Position 3
 * @param {number} y3 - Position 3
 */
function move(x1, y1, x2, y2, x3, y3) {
  let temp1 = cubes[x1][y1].color;
  let temp2 = cubes[x2][y2].color;
  let temp3 = cubes[x3][y3].color;

  cubes[x1][y1].color = temp3;
  cubes[x2][y2].color = temp1;
  cubes[x3][y3].color = temp2;

  if (!puzzleSolved) {
    movesTotal++;
  }
}

/** Apply the color of the cube objects to the HTML elements */
function drawCubes() {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      cubes[x][y].el.style.backgroundColor = cubes[x][y].color;
    }
  }
}

/**
 * Randomize two positions and switch them
 * @param {number} turns Amount of times it switches the positions
 */
function randomizeColors(turns) {
  for (let i = 0; i < turns; i++) {
    let pos1 = getRandomPosition();
    let pos2 = getRandomPosition();
    let samePosition = true; // To get into the loop

    while (samePosition) {
      if (pos1.x === pos2.x && pos1.y === pos2.y) {
        pos2 = getRandomPosition();
      } else {
        samePosition = false;
      }
    }

    switchTwoColors(pos1, pos2);
  }
}

function getRandomPosition() {
  let xValue = Math.floor(Math.random() * 3);
  let yValue = Math.floor(Math.random() * 3);

  return {x: xValue, y: yValue};
}

function switchTwoColors(position1, position2) {
  const p1 = position1;
  const p2 = position2;

  let tempColor1 = cubes[p1.x][p1.y].color;
  let tempColor2 = cubes[p2.x][p2.y].color;

  cubes[p1.x][p1.y].color = tempColor2;
  cubes[p2.x][p2.y].color = tempColor1;
}

/** When the puzzle gets solved, show the indicator for it and stop the timer and move counting */
function checkIfSolved() {
  let firstRowSolved = [];
  let secondRowSolved = [];
  let thirdRowSolved = [];

  for (let i = 0; i < 3; i++) {
    if (cubes[i][0].color === currentColors.c1) {
      firstRowSolved.push(1);
    }
    if (cubes[i][1].color === currentColors.c2) {
      secondRowSolved.push(1);
    }
    if (cubes[i][2].color === currentColors.c3) {
      thirdRowSolved.push(1);
    }
  }
  
  if (firstRowSolved.length === 3 && 
      secondRowSolved.length === 3 && 
      thirdRowSolved.length === 3 && 
      solvedByUser) {
    indicators.s.el.style.backgroundColor = currentColors.solved;
    timerRunning = false;
    puzzleSolved = true;
  } else {
    indicators.s.el.style.backgroundColor = "unset";
  }
}

function drawTimeText() {
  if (hideTimer) {
    timeText.style.color = "transparent";
  } else {
    timeText.style.color = currentColors.text;
  }
  
  timeText.style.fontSize = `${textSize}px`;
  timeText.textContent = time;

  timeText.style.translate = 
    `${timeTextXPos - timeText.offsetWidth}px 
    ${timeTextYPos}px`
}

function drawMovesText() {
  let offset;

  if (hideMoves) {
    movesText.style.color = "transparent";
  } else {
    movesText.style.color = currentColors.text;
  }
  
  movesText.style.fontSize = `${textSize}px`;
  movesText.textContent = movesTotal;

  // If the timer is hidden, `movesText` takes the position of it
  if (hideTimer) {
    offset = 0;
  } else {
    offset = movesTextOffset;
  }

  movesText.style.translate = 
    `${timeTextXPos - movesText.offsetWidth}px 
    ${timeTextYPos + offset}px`
}


// First step of creating the cubes
function createCubeObjects() {
  for (let i = 1; i <= 9; i++) {
    cubeObjects[`c${i}`] = {
      el: document.getElementById(`cube${i}`),
      color: ""
    }
  }
}

// For it to work, the cube objects need to have been added to the cubes array
function drawCubeObjects() {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      cubes[x][y].el.style.width = `${cubeSize}px`;
      cubes[x][y].el.style.height = `${cubeSize}px`;

      cubes[x][y].el.style.translate = 
        `${cubeSizeMarginX + x * cubeSize + x * cubeSizeGap}px 
        ${cubeSizeMarginY + y * cubeSize + y * cubeSizeGap}px`
    }
  }
}

function setCubesColor(row, color) {
  for (let i = 0; i < 3; i++) {
    cubes[i][row].color = color;
  }
}

function resetColors() {
  setCubesColor(0, currentColors.c1);
  setCubesColor(1, currentColors.c2);
  setCubesColor(2, currentColors.c3);

  indicators.r1.el.style.backgroundColor = currentColors.c1;
  indicators.r2.el.style.backgroundColor = currentColors.c2;
  indicators.r3.el.style.backgroundColor = currentColors.c3;

  indicators.s.el.style.backgroundColor = "unset";
}

function createIndicators() {
  for (let i = 1; i <= 3; i++) {
    indicators[`r${i}`] = {
      el: document.getElementById(`ind${i}`)
    }
  }

  indicators["s"] = {
    el: document.getElementById("ind-solved")
  }
}

function drawIndicator(ind, row) {
  ind.el.style.width = `${indicatorSize}px`;
  ind.el.style.height = `${indicatorSize}px`;
  
  ind.el.style.translate = 
    `${cubeSizeMarginX - indicatorMargin}px 
    ${cubeSizeMarginY + cubeSize / 2 - indicatorSize / 2 + row * cubeSize + row * cubeSizeGap}px`
}

function drawIndicatorSolved() {
  let xPos;
  // For changing the size when it moves
  let indSize = indicatorSolvedSize;

  // Change position and size if the text is hidden
  if (hideTimer && hideMoves) {
    indSize *= 1.2;
    xPos = cubeSizeMarginX + wholeCubeWidth - indSize;
  } else {
    xPos = cubeSizeMarginX + wholeCubeWidth + indicatorSolvedMargin;
  }

  indicators.s.el.style.width = `${indSize}px`;
  indicators.s.el.style.height = `${indSize}px`;
  indicators.s.el.style.borderRadius = "50%";

  indicators.s.el.style.translate = 
    `${xPos}px 
    ${timeTextYPos + textSize / 2 - indicatorSolvedSize / 2 + (textSize * 2) * 0.079}px`;
    // (textSize * 2) * 0.079 is for offsetting the circle so it aligns to the center of the text
}

function keyPressed(event) {
  function getKeyPress(key, x, y) {
    if (event.code === keys[x][y]) {
      key.press = true;
    }

    if (key.press) {
      for (const keyP in key) {
        if (keyP === "up") {
          if (event.code === keys[x][y-1]) {
            key[keyP] = true;
          }
        } else if (keyP === "down") {
          if (event.code === keys[x][y+1]) {
            key[keyP] = true;
          }
        } else if (keyP === "left") {
          if (event.code === keys[x-1][y]) {
            key[keyP] = true;
          }
        } else if (keyP === "right") {
          if (event.code === keys[x+1][y]) {
            key[keyP] = true;
          }
        }
      }
    }
  }

  getKeyPress(keyPress.up, 1, 0);
  getKeyPress(keyPress.down, 1, 2);
  getKeyPress(keyPress.left, 0, 1);
  getKeyPress(keyPress.right, 2, 1);
  getKeyPress(keyPress.center, 1, 1);

  // Reset
  if (event.code === resetKey) {
    resetCube = true;
  }

  // Random
  if (event.code === randomizeKey) {
    randomize = true;
  }

  // Timer
  if (event.key === hideTimerKey) {
    if (hideTimer) {
      hideTimer = false;
    } else {
      hideTimer = true;
    }
  }

  // Moves
  if (event.key === hideMovesKey) {
    if (hideMoves) {
      hideMoves = false;
    } else {
      hideMoves = true;
    }
  }

  // Rows
  for (let i = 0; i < keyRowsAmount; i++) {
    const row = `r${i + 1}`;

    if (keyRowsMap[i].includes(event.code)) {
      keyRows[row].press = true;
    }
  }
}

function keyReleased(event) {
  function getKeyRelease(key, x, y) {
    if (event.code === keys[x][y]) {
      key.press = false;
    }
  }

  getKeyRelease(keyPress.up, 1, 0);
  getKeyRelease(keyPress.down, 1, 2);
  getKeyRelease(keyPress.left, 0, 1);
  getKeyRelease(keyPress.right, 2, 1);
  getKeyRelease(keyPress.center, 1, 1);

  // Rows
  for (let i = 0; i < keyRowsAmount; i++) {
    const row = `r${i + 1}`;

    if (keyRowsMap[i].includes(event.code)) {
      keyRows[row].press = false;
      keyRows[row].havePressed = false;
    }
  }
}

// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  createCubeObjects();

  cubes = [
    [cubeObjects.c1, cubeObjects.c4, cubeObjects.c7],
    [cubeObjects.c2, cubeObjects.c5, cubeObjects.c8],
    [cubeObjects.c3, cubeObjects.c6, cubeObjects.c9]
  ];

  drawCubeObjects();

  createIndicators();
  drawIndicator(indicators.r1, 0);
  drawIndicator(indicators.r2, 1);
  drawIndicator(indicators.r3, 2);
  drawIndicatorSolved();

  resetColors();

  document.addEventListener("keydown", keyPressed);
  document.addEventListener("keyup", keyReleased);

  window.requestAnimationFrame(loop);
}

setup(); // Always remember to call setup()!
