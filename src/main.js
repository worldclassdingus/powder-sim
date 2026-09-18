"use strict";

import {
    EMPTY,
    SAND,
    WATER,
    WALL,
    CONCRETE,
    OIL,
    materialName,
} from "./materials.js";
import { Simulation } from "./simulation.js";
import { Renderer } from "./renderer.js";
import { InputController } from "./input.js";

// framerate
const STEPS_PER_SECOND = 60;
const STEP_TIME = 1000 / STEPS_PER_SECOND;

// DOM elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sandButton = document.getElementById("sandButton");
const waterButton = document.getElementById("waterButton");
const wallButton = document.getElementById("wallButton");
const concreteButton = document.getElementById("concreteButton");
const oilButton = document.getElementById("oilButton");

const eraseButton = document.getElementById("eraseButton");
const clearButton = document.getElementById("clearButton");
const stepButton = document.getElementById("stepButton");
const statusIndicator = document.getElementById("statusIndicator");
const runButton = document.getElementById("runButton");

const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

let currentMaterial = SAND;

let brushRadius = Number(brushSizeInput.value);

let running = false;

const simulation = new Simulation(canvas.width, canvas.height);
window.simulation = simulation;
const renderer = new Renderer(ctx);

new InputController(
    canvas, simulation,
    () => currentMaterial,
    () => brushRadius,
    render
)

function chooseMaterial(material) {
    currentMaterial = material;
    render();
}

function toggleRunning() {
    running = !running;

    runButton.textContent = running ? "Pause" : "Run";
}

function updateStatus() {
    const state = running ? "Running" : "Paused";

    statusIndicator.textContent = (
        `${state} | `
        + `Tick: ${simulation.getTickCount()} | `
        + `Material: ${materialName(currentMaterial)} | `
        + `Brush: ${brushRadius}`
    );
}

function stepOnce() {
    simulation.step();
    render();
}

function render() {
    renderer.render(simulation);
    updateStatus();
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

sandButton.addEventListener("click", () => chooseMaterial(SAND));
waterButton.addEventListener("click", () => chooseMaterial(WATER));
wallButton.addEventListener("click", () => chooseMaterial(WALL));
concreteButton.addEventListener("click", () => chooseMaterial(CONCRETE));
oilButton.addEventListener("click", () => chooseMaterial(OIL));

eraseButton.addEventListener("click", () => chooseMaterial(EMPTY));
clearButton.addEventListener("click", () => {
    simulation.clear();
    render();
});
stepButton.addEventListener("click", stepOnce);
runButton.addEventListener("click", toggleRunning);

brushSizeInput.addEventListener("input", () => {
    brushRadius = Number(brushSizeInput.value);
    brushSizeValue.textContent = String(brushRadius);
});

render();