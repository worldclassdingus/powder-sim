
"use strict";

import {
    Material,
    MATERIAL_DEFINITIONS
} from "./materials.js";

export class Simulation {
    readonly width: number;
    readonly height: number;

    readonly cells: Uint8Array;
    
    tickCount: number = 0;

    private readonly updated: Uint8Array;

    constructor(width: number, height: number) {
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

    index(x: number, y: number): number {
        return y * this.width + x;
    }

    insideCanvas(x: number, y: number): boolean {
        return (
            x >= 0
            && x < this.width
            && y >= 0
            && y < this.height
        );
    }

    countMaterial(material: Material): number {
        let count = 0;

        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] === material) { count++; }
        }

        return count;
    }
    
    countNonEmpty(): number {
        let count = 0;

        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] !== Material.Empty) { count++; }
        }

        return count;
    }

    private moveCell(fromX: number, fromY: number, toX: number, toY: number): void {
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        this.cells[to] = this.cells[from];
        this.cells[from] = Material.Empty;
    
        this.updated[to] = 1;
    }

    private swapCells(x1: number, y1: number, x2: number, y2: number): void {
        const i1 = this.index(x1, y1);
        const i2 = this.index(x2, y2);

        const temp = this.cells[i2];
        this.cells[i2] = this.cells[i1];
        this.cells[i1] = temp;

        this.updated[i1] = 1;
        this.updated[i2] = 1;
    }

    private tryMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (!this.insideCanvas(toX, toY)) { return false; }
    
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        if (this.updated[to]) { return false; }
    
        if (this.cells[to] === Material.Empty) {
            this.moveCell(fromX, fromY, toX, toY);
            return true;
        } else if (this.canDisplace(this.cells[from], this.cells[to])) {
            this.swapCells(fromX, fromY, toX, toY);
            return true;
        }
    
        return false;
    }

    private tryMoveIntoEmpty(fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (!this.insideCanvas(toX, toY)) { return false; }
    
        const from = this.index(fromX, fromY);
        const to = this.index(toX, toY);
    
        if (this.updated[to]) { return false; }
    
        if (this.cells[to] === Material.Empty) {
            this.moveCell(fromX, fromY, toX, toY);
            return true;
        }
    
        return false;
    
    }

    private canDisplace(movingMaterial: Material, targetMaterial: Material): boolean {
        const moving = MATERIAL_DEFINITIONS[movingMaterial];
        const target = MATERIAL_DEFINITIONS[targetMaterial];

        if (!target.displaceable) { return false; }

        return (moving.density > target.density);
    }

    private updateMaterial(x: number, y: number): void {
        const material = this.cells[this.index(x, y)];
    
        switch (material) {
            case Material.Sand:
                this.updateSand(x, y);
                break;
            case Material.Water:
            case Material.Oil:
                this.updateLiquid(x, y);
                break;
            case Material.Wall:
                break;
            case Material.Concrete:
                this.updateConcrete(x, y);
    
        }
    }

    private updateSand(x: number, y: number): void {
        const below = y + 1;

        if (this.tryMove(x, y, x, below)) { return; }

        const firstDir = Math.random() < 0.5 ? -1 : 1;

        if (this.tryMove(x, y, x + firstDir, below)) { return; }
        if (this.tryMove(x, y, x - firstDir, below)) { return; }
    }

    private updateLiquid(x: number, y: number): void {
        const below = y + 1;

        if (this.tryMove(x, y, x, below)) { return; }

        const firstDir = Math.random() < 0.5 ? -1 : 1;

        if (this.tryMove(x, y, x + firstDir, below)) { return; }
        if (this.tryMove(x, y, x - firstDir, below)) { return; }
        if (this.tryMoveIntoEmpty(x, y, x + firstDir, y)) { return; }
        if (this.tryMoveIntoEmpty(x, y, x - firstDir, y)) { return; }
    }

    private updateConcrete(x: number, y: number): void {
        const below = y + 1;
            
        if (this.getCell(x - 1, y) === Material.Concrete && this.getCell(x + 1, y) === Material.Concrete) { return; }
    
        this.tryMove(x, y, x, below);
    }

    getCell(x: number, y: number): Material {
        if (!this.insideCanvas(x, y)) { return Material.Empty; }
        return this.cells[this.index(x, y)] as Material;
    }

    setCell(x: number, y: number, material: Material): boolean | void {
        if (!this.insideCanvas(x, y)) { return false; }
        this.cells[this.index(x, y)] = material;
    }

    getTickCount(): number {
        return this.tickCount;
    }

    paintBrush(centerX: number, centerY: number, radius: number, material: Material): void {
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

    step(): void {
        this.updated.fill(0);
        this.tickCount++;

        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const i = this.index(x, y);

                if (this.updated[i]) { continue; }

                if (this.cells[i] !== Material.Empty) {
                    this.updateMaterial(x, y);
                }
            }
        }
    }

    clear(): void {
        this.cells.fill(Material.Empty);
    }
}