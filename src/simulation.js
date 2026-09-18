
"use strict";

import {
    EMPTY,
    SAND,
    WATER,
    WALL,
    CONCRETE,
    OIL,
    materialDensity,
    isDisplaceable
} from "./materials.js";

export class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // stores the 2d canvas as a 1d array
        // rows are stored sequentially
        // (x, y) translates to y * WIDTH + x
        this.cells = new Uint8Array(width * height);

        // tracks cells that have had materials moved into them
        // prevents the same pixel from being moved multiple times in one tick
        this.updated = new Uint8Array(width * height);

        this.tickCount = 0;
    }

    index(x, y) {
        return y * this.width + x;
    }

    insideCanvas(x, y) {
        return (
            x >= 0
            && x < this.width
            && y >= 0
            && y < this.height
        );
    }

    countMaterial(material) {
        let count = 0;

        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] === material) { count++; }
        }

        return count;
    }
    
    countNonEmpty() {
        let count = 0;

        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] !== EMPTY) { count++; }
        }

        return count;
    }

    moveCell(fromX, fromY, toX, toY) {
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        this.cells[to] = this.cells[from];
        this.cells[from] = EMPTY;
    
        this.updated[to] = 1;
    }

    swapCells(x1, y1, x2, y2) {
        const i1 = this.index(x1, y1);
        const i2 = this.index(x2, y2);

        const temp = this.cells[i2];
        this.cells[i2] = this.cells[i1];
        this.cells[i1] = temp;

        this.updated[i1] = 1;
        this.updated[i2] = 1;
    }

    tryMove(fromX, fromY, toX, toY) {
        if (!this.insideCanvas(toX, toY)) { return false; }
    
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        if (this.updated[to]) { return false; }
    
        if (this.cells[to] === EMPTY) {
            this.moveCell(fromX, fromY, toX, toY);
            return true;
        } else if (this.canDisplace(this.cells[from], this.cells[to])) {
            this.swapCells(fromX, fromY, toX, toY);
            return true;
        }
    
        return false;
    }

    tryMoveIntoEmpty(fromX, fromY, toX, toY) {
        if (!this.insideCanvas(toX, toY)) { return false; }
    
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        if (this.updated[to]) { return false; }
    
        if (this.cells[to] === EMPTY) {
            this.moveCell(fromX, fromY, toX, toY);
            return true;
        }
    
        return false;
    
    }

    canDisplace(movingMaterial, targetMaterial) {
        if (!isDisplaceable(targetMaterial)) { return false; }

        return (materialDensity(movingMaterial) > materialDensity(targetMaterial));
    }

    updateMaterial(x, y) {
        const material = this.cells[this.index(x, y)];
    
        switch (material) {
            case SAND:
                this.updateSand(x, y);
                break;
            case WATER:
            case OIL:
                this.updateLiquid(x, y);
                break;
            case WALL:
                break;
            case CONCRETE:
                this.updateConcrete(x, y);
    
        }
    }

    updateSand(x, y) {
        const below = y + 1;

        if (this.tryMove(x, y, x, below)) { return; }

        const firstDir = Math.random() < 0.5 ? -1 : 1;

        if (this.tryMove(x, y, x + firstDir, below)) { return; }
        if (this.tryMove(x, y, x - firstDir, below)) { return; }
    }

    updateLiquid(x, y) {
        const below = y + 1;

        if (this.tryMove(x, y, x, below)) { return; }

        const firstDir = Math.random() < 0.5 ? -1 : 1;

        if (this.tryMove(x, y, x + firstDir, below)) { return; }
        if (this.tryMove(x, y, x - firstDir, below)) { return; }
        if (this.tryMoveIntoEmpty(x, y, x + firstDir, y)) { return; }
        if (this.tryMoveIntoEmpty(x, y, x - firstDir, y)) { return; }
    }

    updateConcrete(x, y) {
        const below = y + 1;
            
        if (this.getCell(x - 1, y) === CONCRETE && this.getCell(x + 1, y) === CONCRETE) { return; }
    
        this.tryMove(x, y, x, below)
    }

    getCell(x, y) {
        if (!this.insideCanvas(x, y)) { return false; }
        return this.cells[this.index(x, y)];
    }

    setCell(x, y, material) {
        if (!this.insideCanvas(x, y)) { return false; }
        this.cells[this.index(x, y)] = material;
    }

    getTickCount() {
        return this.tickCount;
    }

    paintBrush(centerX, centerY, radius, material) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {

                // paint in a circle
                if (dx * dx + dy * dy > radius * radius) { continue; }

                const x = centerX + dx;
                const y = centerY + dy;

                if (!this.insideCanvas(x, y)) { continue; }

                this.setCell(x, y, material);

            }
        }
    }

    step() {
        this.updated.fill(0);
        this.tickCount++;

        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const i = this.index(x, y);

                if (this.updated[i]) { continue; }

                if (this.cells[i] !== EMPTY) {
                    this.updateMaterial(x, y);
                }
            }
        }
    }

    clear() {
        this.cells.fill(EMPTY);
    }
}