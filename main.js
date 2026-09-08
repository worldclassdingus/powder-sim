"use strict";

// pixel/powder types
const EMPTY = 0;
const POWDER = 1;

// DOM elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("drawButton");
const eraseButton = document.getElementById("eraseButton");
const clearButton = document.getElementById("clearButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let currentMaterial = POWDER;
let pointerDown = false;

// stores the 2d canvas as a 1d array.
// rows are stored sequentially
// (x, y) translates to y * WIDTH + x
const cells = new Uint8Array(WIDTH * HEIGHT);

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

    const i = findIndex(cell.x, cell.y);

    cells[i] = currentMaterial;

    render();
}

function render() {
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "black";

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {

            const i = findIndex(x, y);

            if (cells[i] === POWDER) {
                ctx.fillRect(x, y, 1, 1);
            }

        }
    }
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

    paint(event);
}

function handlePointerMove(event) {
    if (pointerDown) {
        paint(event);
    }
}

function handlePointerUp(event) {
    pointerDown = false;
}

function chooseDraw() {
    currentMaterial = POWDER;
}

function chooseErase() {
    currentMaterial = EMPTY;;
}

function clearCanvas() {
    cells.fill(EMPTY);

    render();
}


canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", handlePointerUp);

drawButton.addEventListener("click", chooseDraw);
eraseButton.addEventListener("click", chooseErase);
clearButton.addEventListener("click", clearCanvas);

render();