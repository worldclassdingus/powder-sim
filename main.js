"use strict";

// pixel/powder types
const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const WALL = 3;

// framerate
const STEPS_PER_SECOND = 60;
const STEP_TIME = 1000 / STEPS_PER_SECOND;

// DOM elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sandButton = document.getElementById("sandButton");
const waterButton = document.getElementById("waterButton");
const wallButton = document.getElementById("wallButton");

const eraseButton = document.getElementById("eraseButton");
const clearButton = document.getElementById("clearButton");
const stepButton = document.getElementById("stepButton");
const statusIndicator = document.getElementById("statusIndicator");
const runButton = document.getElementById("runButton");

const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let currentMaterial = SAND;
let pointerDown = false;
let lastPaintCell = null;

let brushRadius = Number(brushSizeInput.value);

let tickCount = 0;
let running = false;

// stores the 2d canvas as a 1d array.
// rows are stored sequentially
// (x, y) translates to y * WIDTH + x
const cells = new Uint8Array(WIDTH * HEIGHT);

// tracks cells that have had materials moved into them
// prevents the same pixel from being moved multiple times in one tick
const updated = new Uint8Array(WIDTH * HEIGHT);

function materialName(material) {
    switch(material) {
        case SAND:
            return "Sand";
        case WATER:
            return "Water";
        case WALL:
            return "Wall";
        case EMPTY:
            return "Eraser";
        default:
            return "Unknown";
    }
}

function chooseMaterial(material) {
    currentMaterial = material;
    render();
}

function paintLine(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;

    const steps = Math.max(
        Math.abs(dx),
        Math.abs(dy)
    );

    if (steps === 0) {
        paintBrush(x0, y0);
        return;
    }

    for (let i = 0; i < steps; i++) {
        const t = i / steps;

        const x = Math.round(x0 + dx * t);
        const y = Math.round(y0 + dy * t);

        paintBrush(x, y);
    }


}

function paintBrush(centerX, centerY) {
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
        for (let dx = -brushRadius; dx <= brushRadius; dx++) {

            // paint in a circle
            if (dx * dx + dy * dy > brushRadius * brushRadius) { continue; }

            const x = centerX + dx;
            const y = centerY + dy;

            if (!insideCanvas(x, y)) { continue; }

            cells[findIndex(x, y)] = currentMaterial;

        }
    }
}

function updateMaterial(x, y) {
    const material = cells[findIndex(x, y)];

    switch (material) {
        case SAND:
            updateSand(x, y);
            break;
        case WATER:
            updateWater(x, y);
            break;
        case WALL:
            break;

    }
}

function materialColor(material) {
    switch(material) {
        case SAND:
            return "#d8b45a";
        case WATER:
            return "#3f7fe8";
        case WALL:
            return "#666666";

        default:
            return null;
    }
}

function countMaterial(material) {
    let count = 0;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i] === material) { count++; }
    }

    return count;
}

function countNonEmpty() {
    let count = 0;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i] !== EMPTY) { count++; }
    }

    return count;
}

function toggleRunning() {
    running = !running;

    runButton.textContent = running ? "Pause" : "Run";
}

function updateStatus() {
    const state = running ? "Running" : "Paused";
    const sandCount = countMaterial(SAND);

    statusIndicator.textContent = (
        `${state} | `
        + `Tick: ${tickCount} | `
        + `Material: ${materialName(currentMaterial)} | `
        + `Brush: ${brushRadius}`
    );
}

function step() {
    console.log("simulation step");

    updated.fill(0);

    for (let y = HEIGHT - 2; y >= 0; y--) {
        for (let x = 0; x < WIDTH; x++) {

            const cell = findIndex(x, y);

            if (updated[cell]) { continue; }

            if (cells[cell] !== EMPTY) {
                updateMaterial(x, y);
            }
        }
    }
}

function stepOnce() {
    step();
    render();

    tickCount++;
}

function updateWater(x, y) {
    const below = y + 1;

    const firstDir = Math.random() < 0.5 ? -1 : 1;
    const secondDir = -firstDir;

    if (isEmpty(x, below)) {
        moveCell(x, y, x, below);
    } else if (isEmpty(x + firstDir, below)) {
        moveCell(x, y, x + firstDir, below);
    } else if (isEmpty(x + secondDir, below)) {
        moveCell(x, y, x + secondDir, below);
    } else if (isEmpty(x + firstDir, y)) {
        moveCell(x, y, x + firstDir, y);
    } else if (isEmpty(x + secondDir, y)) {
        moveCell(x, y, x + secondDir, y);
    }
}

function updateSand(x, y) {
    const below = y + 1;

    const firstDir = Math.random() < 0.5 ? -1 : 1;
    const secondDir = -firstDir;

    if (isEmpty(x, below)) {
        moveCell(x, y, x, below);
    } else if (isEmpty(x + firstDir, below)) {
        moveCell(x, y, x + firstDir, below);
    } else if (isEmpty(x + secondDir, below)) {
        moveCell(x, y, x + secondDir, below);
    }
}

function moveCell(fromX, fromY, toX, toY) {
    const from = findIndex(fromX, fromY);
    const to = findIndex(toX, toY);

    cells[to] = cells[from];
    cells[from] = EMPTY;

    updated[to] = 1;
}

function isEmpty(x, y) {
    if (!insideCanvas(x, y)) { return false; }

    return ( cells[findIndex(x, y)] === EMPTY );
}

function insideCanvas(x, y) {
    return (
        x >= 0 &&
        x < WIDTH &&
        y >= 0 &&
        y < HEIGHT
    );
}

function paint(event) {
    const cell = pointerToCell(event);

    if (!insideCanvas(cell.x, cell.y)) { return; }

    if (lastPaintCell === null) {
        paintBrush(cell.x, cell.y);
    } else {
        paintLine(lastPaintCell.x, lastPaintCell.y, cell.x, cell.y);
    }

    lastPaintCell = cell;
    render();
}

function render() {
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "black";

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {

            const material = cells[findIndex(x, y)];
            const color = materialColor(material);

            if (color !== null) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }

        }
    }

    updateStatus();
}

function findCoords(i) {
    // find the coordinates of a cell from its index in the cells array
    const x = i % WIDTH;
    const y = Math.floor(i / WIDTH);

    return {x, y};
}

function findIndex(x, y) {
    // find the index of a cell in the cells array
    return y * WIDTH + x;
}

function pointerToCell(event) {
    const canvasRect = canvas.getBoundingClientRect();

    // calculate coordinates in terms of the canvas.
    // Find the canvas coordinates in screen pixels,
    // then convert to canvas pixels.

    const x = Math.floor(
        (event.clientX - canvasRect.left)
        / canvasRect.width
        * WIDTH
    );

    const y = Math.floor(
        (event.clientY - canvasRect.top)
        / canvasRect.height
        * HEIGHT
    );

    return {x, y};
}

// event listener functions

function handlePointerDown(event) {
    pointerDown = true;
    lastPaintCell = null;

    canvas.setPointerCapture(event.pointerId);

    paint(event);
}

function handlePointerMove(event) {
    if (pointerDown) {
        paint(event);
    }
}

function handlePointerUp(event) {
    pointerDown = false;
    lastPaintCell = null;
}

function finishPointer() {
    pointerDown = false;
    lastPaintCell = null;
}

function chooseDraw() {
    currentMaterial = SAND;
}

function chooseErase() {
    currentMaterial = EMPTY;
}

function clearCanvas() {
    cells.fill(EMPTY);

    render();
}


// animation frame (for the loop)
let previousFrameTime = null;
let accumulator = 0;

function frame(timestamp) {
    if (previousFrameTime === null) {
        previousFrameTime = timestamp;
    }

    let elapsed = timestamp - previousFrameTime;
    elapsed = Math.min(elapsed, 100);
    previousFrameTime = timestamp;

    if (running) {
        accumulator += elapsed;

        while (accumulator > STEP_TIME) {
            stepOnce();
            accumulator -= STEP_TIME;
        }

        render();
    } else {
        accumulator = 0;
    }

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);


canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", finishPointer);
canvas.addEventListener("pointercancel", finishPointer);
window.addEventListener("pointerup", handlePointerUp);

sandButton.addEventListener("click", () => chooseMaterial(SAND));
waterButton.addEventListener("click", () => chooseMaterial(WATER));
wallButton.addEventListener("click", () => chooseMaterial(WALL));

eraseButton.addEventListener("click", () => chooseMaterial(EMPTY));
clearButton.addEventListener("click", clearCanvas);
stepButton.addEventListener("click", stepOnce);
runButton.addEventListener("click", toggleRunning);

brushSizeInput.addEventListener("input", () => {
    brushRadius = Number(brushSizeInput.value);
    brushSizeValue.textContent = String(brushRadius);
});

render();