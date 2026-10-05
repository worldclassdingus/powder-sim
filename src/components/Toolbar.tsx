
import { Material } from "@/sim/Materials";

type ToolbarProps = {
    selectedMaterial: Material;
    brushRadius: number;
    running: boolean;
    onSelectMaterial: (material: Material) => void;
    onBrushRadiusChange: (radius: number) => void;
    onStep: () => void;
    onToggleRunning: () => void;
    onClear: () => void;
};

export default function Toolbar({
    selectedMaterial,
    brushRadius,
    running,
    onSelectMaterial,
    onBrushRadiusChange,
    onStep,
    onToggleRunning,
    onClear,
}: ToolbarProps) {
    function materialButtonClass(material: Material): string {
        return(material === selectedMaterial ? "material-button selected" : "material-buton");
    }

    return (
        <div className="toolbar">
            <button
                className={materialButtonClass(Material.Sand)}
                onClick={() => onSelectMaterial(Material.Sand)}
            >
                Sand
            </button>

            <button
                className={materialButtonClass(Material.Water)}
                onClick={() => onSelectMaterial(Material.Water)}
            >
                Water
            </button>

            <button
                className={materialButtonClass(Material.Wall)}
                onClick={() => onSelectMaterial(Material.Wall)}
            >
                Wall
            </button>

            <button
                className={materialButtonClass(Material.Concrete)}
                onClick={() => onSelectMaterial(Material.Concrete)}
            >
                Concrete
            </button>

            <button
                className={materialButtonClass(Material.Oil)}
                onClick={() => onSelectMaterial(Material.Oil)}
            >
                Oil
            </button>

            <button
                className={materialButtonClass(Material.Empty)}
                onClick={() => onSelectMaterial(Material.Empty)}
            >
                Erase
            </button>

            <label htmlFor="brushSize">
                Brush:
            </label>

            <input
                id="brushSize"
                type="range"
                min="0"
                max="8"
                value={brushRadius}
                onChange={(event) => { onBrushRadiusChange(Number(event.target.value)) }}
            />

            <span>{brushRadius}</span>

            <button onClick={onStep}>
                Step Once
            </button>

            <button onClick={onToggleRunning}>
                {running ? "Pause" : "Run"}
            </button>

            <button onClick={onClear}>
                Clear
            </button>
        </div>
    );
}