interface CanvasHeaderProps {
  onStrokeWidthChange: (v: number) => any;
  value: number;
  onColorChanged: (v: string) => any;
  colorValue: string;
  onEraserClicked: () => any;
  onPenClicked: () => any;
}

export default function CanvasHeader({
  onStrokeWidthChange,
  value,
  onColorChanged,
  colorValue,
  onEraserClicked,
  onPenClicked,
}: CanvasHeaderProps) {
  return (
    <div className="absolute p-2 top-0 left-0 flex flex-row gap-2">
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        onChange={(v) => onStrokeWidthChange(parseInt(v.currentTarget.value))}
        value={value}
      />
      <input
        type="color"
        value={colorValue}
        onChange={(v) => onColorChanged(v.currentTarget.value)}
      />
      <button onClick={onEraserClicked}>Eraser</button>
      <button onClick={onPenClicked}>Pen</button>
    </div>
  );
}
