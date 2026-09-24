"use strict";

import {
    Material,
    MATERIAL_DEFINITIONS
} from "./materials.js";
import type { Simulation } from "./simulation.js";

export class Renderer {
    constructor(private readonly context: CanvasRenderingContext2D) {}

    render(simulation: Simulation): void {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, simulation.width, simulation.height);
        
        for (let y = 0; y < simulation.height; y++) {
            for (let x = 0; x < simulation.width; x++) {
                const material = simulation.getCell(x, y);
                const color = MATERIAL_DEFINITIONS[material].color;

                if (color === null) { continue };

                this.context.fillStyle = color;
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }

}