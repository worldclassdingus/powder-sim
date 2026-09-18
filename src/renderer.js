"use strict";

import { materialColor} from "./materials.js";

export class Renderer {
    constructor(context) {
        this.context = context;
    }

    render(simulation) {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, simulation.width, simulation.height);
        
        for (let y = 0; y < simulation.height; y++) {
            for (let x = 0; x < simulation.width; x++) {
                const material = simulation.getCell(x, y);
                const color = materialColor(material);

                if (color === null) { continue };

                this.context.fillStyle = color;
                this.context.fillRect(x, y, 1, 1);
            }
        }
    }

}