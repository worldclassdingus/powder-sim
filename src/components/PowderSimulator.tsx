"use client";

import {
    useEffect, useRef, useState,
    type PointerEvent as ReactPointerEvent
} from "react";
import {
    pointerToCell,
    paintLine,
    type Point
} from "@/sim/Input";
import { Simulation } from "@/sim/Simulation";
import { CanvasRenderer } from "@/sim/CanvasRenderer";
import { Material } from "@/sim/Materials";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";

const STEPS_PER_SECOND = 60;
const STEP_TIME = 1000 / STEPS_PER_SECOND;

export default function PowderSimulator() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const simulationRef = useRef<Simulation | null>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);

    const pointerDownRef = useRef(false);
    const lastPaintCellRef = useRef<Point | null>(null);

    const [ selectedMaterial, setSelectedMaterial ] = useState(Material.Sand);
    const [ brushRadius, setBrushRadius ] = useState(3);
    const [ running, setRunning ] = useState(false);
    const [ tickCount, setTickCount ] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas === null) {
            return;
        }

        const simulation = new Simulation(canvas.width, canvas.height);

        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("2D canvas context is unavailable");
        }
        const renderer = new CanvasRenderer(ctx, simulation);

        simulationRef.current = simulation;
        rendererRef.current = renderer;

        renderer.render();

        return () => {
            simulationRef.current = null;
            rendererRef.current = null;
        };

    }, []);

    useEffect(() => {
        if (!running) { return; }

        let frameId = 0;
        let previousFrameTime: number | null = null;
        let accumulator = 0;
        let lastStatusUpdate = 0;

        function frame(timestamp: number): void {
            const simulation = simulationRef.current;
            const renderer = rendererRef.current;

            if (simulation !== null && renderer !== null) {
                if (previousFrameTime === null) {
                    previousFrameTime = timestamp;
                }

                let elapsed = timestamp - previousFrameTime;
                elapsed = Math.min(elapsed, 100);

                accumulator += elapsed;
                previousFrameTime = timestamp;

                let stepped = false;

                while(accumulator >= STEP_TIME) {
                    simulation.step();
                    accumulator -= STEP_TIME;
                    stepped = true;
                }

                if (stepped) {
                    renderer.render();
                }

                if (timestamp - lastStatusUpdate >= 100) {
                    setTickCount(simulation.getTickCount());
                    lastStatusUpdate = timestamp;
                }
            }

            frameId = requestAnimationFrame(frame);
        }
        
        frameId = requestAnimationFrame(frame);

        return () => { cancelAnimationFrame(frameId); };
    }, [ running ]);

    function paintAtPointer(event: ReactPointerEvent<HTMLCanvasElement>): Point | null {
        const simulation = simulationRef.current;
        const renderer = rendererRef.current;

        if (simulation === null || renderer === null) {
            return null;
        }

        const cell = pointerToCell(event.currentTarget, event.clientX, event.clientY);

        if (!simulation.insideCanvas(cell.x, cell.y)) {
            return null;
        }

        const lastPaintCell = lastPaintCellRef.current;
        
        if (lastPaintCell === null) {
            simulation.paintBrush(cell.x, cell.y, brushRadius, selectedMaterial);
        } else {
            paintLine(simulation, lastPaintCell, cell, brushRadius, selectedMaterial);
        }

        lastPaintCellRef.current = cell;
        renderer.render();

        return cell;
    }

    function stepOnce(): void {
        const simulation = simulationRef.current;
        const renderer = rendererRef.current;

        if (simulation === null || renderer === null) {
            return;
        }

        simulation.step();
        renderer.render();

        setTickCount(simulation.getTickCount());
    }

    function clearWorld(): void {
        const simulation = simulationRef.current;
        const renderer = rendererRef.current;

        if (simulation === null || renderer === null) {
            return;
        }

        simulation.clear();
        renderer.render();

        setTickCount(simulation.getTickCount());
    }

    function toggleRunning(): void {
        const nextRunning = !running;
        setRunning(nextRunning);

        if (!nextRunning) {
            const simulation = simulationRef.current;

            if (simulation !== null) {
                setTickCount(simulation.getTickCount());
            }
        }
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>): void {
        pointerDownRef.current = true;
        lastPaintCellRef.current = null;

        event.currentTarget.setPointerCapture(event.pointerId);

        paintAtPointer(event);
    }


    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>): void {
        if (pointerDownRef.current) {
            paintAtPointer(event);
        }
    }

    function finishPointer(): void {
        pointerDownRef.current = false;
        lastPaintCellRef.current = null;
    }

    return (
        <section className="simulator">
            <StatusBar
                running={running}
                tickCount={tickCount}
                selectedMaterial={selectedMaterial}
                brushRadius={brushRadius}
            />

            <Toolbar
                selectedMaterial={selectedMaterial}
                brushRadius={brushRadius}
                running={running}
                onSelectMaterial={setSelectedMaterial}
                onBrushRadiusChange={setBrushRadius}
                onStep={stepOnce}
                onToggleRunning={toggleRunning}
                onClear={clearWorld}
            />

            <canvas
                ref={canvasRef}
                className="simulation-canvas"
                width={160}
                height={120}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointer}
                onPointerCancel={finishPointer}
            />
        </section>
    );
}