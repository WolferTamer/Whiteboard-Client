interface CanvasHeaderProps {
  onStrokeWidthChange: (v: number) => any;
  value: number;
  onColorChanged: (v: string) => any;
  colorValue: string;
  onEraserClicked: () => any;
  onPenClicked: () => any;
  tool: "eraser" | "pen";
  code?: string;
  connected?: boolean;
}

export default function CanvasHeader({
  onStrokeWidthChange,
  value,
  onColorChanged,
  colorValue,
  onEraserClicked,
  onPenClicked,
  tool,
  connected,
}: CanvasHeaderProps) {
  return (
    <div className="absolute p-2 top-0 left-0 flex flex-row items-center justify-start gap-2 w-full">
      <div className="flex flex-col items-start justify-start">
        <label htmlFor="width" className="font-bold text-black">
          {`Line Width: ${value}`}
        </label>
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          onChange={(v) => onStrokeWidthChange(parseInt(v.currentTarget.value))}
          value={value}
          name="width"
        />
      </div>
      <input
        type="color"
        value={colorValue}
        onChange={(v) => onColorChanged(v.currentTarget.value)}
      />
      <button
        onClick={onEraserClicked}
        className={`hover:pointer rounded-md p-2 border ${tool === "eraser" ? "bg-green-300" : ""}`}
      >
        Eraser
      </button>
      <button
        onClick={onPenClicked}
        className={`hover:pointer rounded-md p-2 border ${tool === "pen" ? "bg-green-300" : ""}`}
      >
        Pen
      </button>
      <div className="ml-auto flex-col items-end">
        {connected ? "" : <div>Trying to Reconnect...</div>}
      </div>
    </div>
  );
}
