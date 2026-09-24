"use strict";

import { Material } from "./materials";
import type { Simulation } from "./simulation";

interface Point {
    readonly x: number;
    readonly y: number;
}

export class InputController {
    private lastPaintCell: Point | null = null;
    private pointerDown: boolean = false;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly simulation: Simulation,
        private readonly currentMaterial: () => Material,
        private readonly brushSize: () => number,
        private readonly render: () => void,
    ) {
        this.canvas.addEventListener("pointerdown", event => this.handlePointerDown(event));
        this.canvas.addEventListener("pointermove", event => this.handlePointerMove(event));
        this.canvas.addEventListener("pointerup", () => this.finishPointer());
        this.canvas.addEventListener("pointercancel", () => this.finishPointer());
    }

    pointerToCell(event: PointerEvent): Point {
        const canvasRect = this.canvas.getBoundingClientRect();

        // calculate coordinates in terms of the canvas.
        // Find the canvas coordinates in screen pixels,
        // then convert to canvas pixels.

        const x = Math.floor(
            (event.clientX - canvasRect.left)
            / canvasRect.width
            * this.canvas.width
        );

        const y = Math.floor(
            (event.clientY - canvasRect.top)
            / canvasRect.height
            * this.canvas.height
        );

        return {x, y};
    }

    paintLine(x0: number, y0: number, x1: number, y1: number): void {
        const brsh = this.brushSize();
        const mtrl = this.currentMaterial();

        const dx = x1 - x0;
        const dy = y1 - y0;

        const steps = Math.max(
            Math.abs(dx),
            Math.abs(dy)
        );

        if (steps === 0) {
            this.simulation.paintBrush(x0, y0, brsh, mtrl);
            return;
        }

        for (let i = 0; i < steps; i++) {
            const t = i / steps;

            const x = Math.round(x0 + dx * t);
            const y = Math.round(y0 + dy * t);

            this.simulation.paintBrush(x, y, brsh, mtrl);
        }


    }

    paint(event: PointerEvent): void {
        const brsh = this.brushSize();
        const mtrl = this.currentMaterial();

        const cell = this.pointerToCell(event);

        if (!this.simulation.insideCanvas(cell.x, cell.y)) { return; }

        if (this.lastPaintCell === null) {
            this.simulation.paintBrush(cell.x, cell.y, brsh, mtrl);
        } else {
            this.paintLine(this.lastPaintCell.x, this.lastPaintCell.y, cell.x, cell.y);
        }

        this.lastPaintCell = cell;
        this.render();
    }

    handlePointerDown(event: PointerEvent): void {
        this.pointerDown = true;
        this.lastPaintCell = null;

        this.canvas.setPointerCapture(event.pointerId);

        this.paint(event);
    }

    handlePointerMove(event: PointerEvent): void {
        if (this.pointerDown) {
            this.paint(event);
        }
    }

    finishPointer(): void {
        this.pointerDown = false;
        this.lastPaintCell = null;
    }

}