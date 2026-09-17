
"use strict";


export const EMPTY = 0;
export const SAND = 1;
export const WATER = 2;
export const WALL = 3;
export const CONCRETE = 4;
export const OIL = 5;

export function materialName(material) {
    switch(material) {
        case EMPTY: return "Eraser";
        case SAND: return "Sand";
        case WATER: return "Water";
        case WALL: return "Wall";
        case CONCRETE: return "Concrete";
        case OIL: return "Oil";

        default: return "Unknown";
    }
}

export function materialColor(material) {
    switch(material) {
        case SAND: return "#d8b45a";
        case WATER: return "#3f7fe8";
        case WALL: return "#666666";
        case CONCRETE: return "#2c2f35";
        case OIL: return "#886524";

        default: return null;
    }
}

export function materialDensity(material) {
    switch(material) {
        case SAND: return 3;
        case WATER: return 2;
        case CONCRETE: return 3;
        case OIL: return 1;

        default: return 0;
    }
}

export function isDisplaceable(material) {
    return (
        material === WATER ||
        material === OIL
    );
}