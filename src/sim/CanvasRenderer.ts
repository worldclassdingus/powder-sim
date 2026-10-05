"use strict";

import {
    MATERIAL_DEFINITIONS
} from "./Materials";
import type { Simulation } from "./Simulation";

export class CanvasRenderer {
    constructor(private readonly context: CanvasRenderingContext2D, private readonly simulation: Simulation) {}

    render(): void {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.simulation.width, this.simulation.height);
        
        for (let y = 0; y < this.simulation.height; y++) {
            for (let x = 0; x < this.simulation.width; x++) {
                const material = this.simulation.getCell(x, y);
                const color = MATERIAL_DEFINITIONS[material].color;

                if (color === null) { continue };

                this.context.fillStyle = color;
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }

}