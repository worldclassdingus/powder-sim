"use strict";

import { Material } from "@/sim/Materials";
import type { Simulation } from "@/sim/Simulation";

export interface Point {
    readonly x: number;
    readonly y: number;
}

export function pointerToCell(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
    const canvasRect = canvas.getBoundingClientRect();

    // calculate coordinates in terms of the canvas.
    // Find the canvas coordinates in screen pixels,
    // then convert to canvas pixels.

    const x = Math.floor(
        (clientX - canvasRect.left)
        / canvasRect.width
        * canvas.width
    );

    const y = Math.floor(
        (clientY - canvasRect.top)
        / canvasRect.height
        * canvas.height
    );

    return {x, y};
}

export function paintLine(simulation: Simulation, start: Point, end: Point, brushSize: number, material: Material): void {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const steps = Math.max(
        Math.abs(dx),
        Math.abs(dy)
    );

    if (steps === 0) {
        simulation.paintBrush(start.x, start.y, brushSize, material);
        return;
    }

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        const x = Math.round(start.x + dx * t);
        const y = Math.round(start.y + dy * t);

        simulation.paintBrush(x, y, brushSize, material);
    }


}