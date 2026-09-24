"use strict";

import { Material, MATERIAL_DEFINITIONS } from "./materials.js";
import { Simulation } from "./simulation.js";
import { Renderer } from "./renderer.js";
import { InputController } from "./input.js";

// framerate
const STEPS_PER_SECOND = 60;
const STEP_TIME = 1000 / STEPS_PER_SECOND;

// DOM elements
const canvasElement = requireElement("canvas");
if ( !(canvasElement instanceof HTMLCanvasElement) ) {
    throw new Error("#canvas is not a canvas element");
}
const canvas = canvasElement;

const ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error("2D canvas context is unavailable");
}

const sandButton = requireElement("sandButton");
const waterButton = requireElement("waterButton");
const wallButton = requireElement("wallButton");
const concreteButton = requireElement("concreteButton");
const oilButton = requireElement("oilButton");

const eraseButton = requireElement("eraseButton");
const clearButton = requireElement("clearButton");
const stepButton = requireElement("stepButton");
const statusIndicator = requireElement("statusIndicator");
const runButton = requireElement("runButton");

const brushSizeElement = requireElement("brushSize");
if ( !(brushSizeElement instanceof HTMLInputElement) ) {
    throw new Error("#brushSize is not an input element");
}

const brushSizeInput = brushSizeElement;
const brushSizeValue = requireElement("brushSizeValue");

let currentMaterial = Material.Sand;

let brushRadius = Number(brushSizeInput.value);

let running = false;

const simulation = new Simulation(canvas.width, canvas.height);
Object.assign(window, { simulation }); // for debugging
const renderer = new Renderer(ctx);

new InputController(
    canvas, simulation,
    () => currentMaterial,
    () => brushRadius,
    render
);

function requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);

    if (element === null) {
        throw new Error(`Missing element #${id}`);
    }

    return element;
}

function chooseMaterial(material: Material): void {
    currentMaterial = material;
    render();
}

function toggleRunning(): void {
    running = !running;

    runButton.textContent = running ? "Pause" : "Run";
}

function updateStatus(): void {
    const state = running ? "Running" : "Paused";

    statusIndicator.textContent = (
        `${state} | `
        + `Tick: ${simulation.getTickCount()} | `
        + `Material: ${MATERIAL_DEFINITIONS[currentMaterial].name} | `
        + `Brush: ${brushRadius}`
    );
}

function stepOnce(): void {
    simulation.step();
    render();
}

function render(): void {
    renderer.render(simulation);
    updateStatus();
}

// animation frame (for the loop)
let previousFrameTime: number | null = null;
let accumulator = 0;

function frame(timestamp: number): void {
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

sandButton.addEventListener("click", () => chooseMaterial(Material.Sand));
waterButton.addEventListener("click", () => chooseMaterial(Material.Water));
wallButton.addEventListener("click", () => chooseMaterial(Material.Wall));
concreteButton.addEventListener("click", () => chooseMaterial(Material.Concrete));
oilButton.addEventListener("click", () => chooseMaterial(Material.Oil));

eraseButton.addEventListener("click", () => chooseMaterial(Material.Empty));
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