
"use strict";

export enum Material {
    Empty = 0,
    Sand = 1,
    Water = 2,
    Wall = 3,
    Concrete = 4,
    Oil = 5,
}

export interface MaterialDefinition {
    readonly name: string;
    readonly color: string | null;
    readonly density: number;
    readonly displaceable: boolean;
}

export const MATERIAL_DEFINITIONS: readonly MaterialDefinition[] = [
    {
        name: "Eraser",
        color: null,
        density: 0,
        displaceable: false,
    },
    {
        name: "Sand",
        color: "#d8b45a",
        density: 3,
        displaceable: false,
    },
    {
        name: "Water",
        color: "#3f7fe8",
        density: 2,
        displaceable: true,
    },
    {
        name: "Wall",
        color: "#666666",
        density: 0,
        displaceable: false,
    },
    {
        name: "Concrete",
        color: "#2c2f35",
        density: 3,
        displaceable: false,
    },
    {
        name: "Oil",
        color: "#886524",
        density: 1,
        displaceable: true,
    }
]