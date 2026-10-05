import { Material, MATERIAL_DEFINITIONS } from "@/sim/Materials";

type StatusBarProps = {
    running: boolean;
    tickCount: number;
    selectedMaterial: Material;
    brushRadius: number;
};

export default function StatusBar({
    running,
    tickCount,
    selectedMaterial,
    brushRadius
}: StatusBarProps) {
    return(
        <p className="status">
            {running ? "Running" : "Paused"}
            {" | "}
            Tick: {tickCount}
            {" | "}
            Material: {MATERIAL_DEFINITIONS[selectedMaterial].name}
            {" | "}
            Brush: {brushRadius}
        </p>
    )
}