//The Canvas Controller that manages the whiteboard.

import { useEffect, useRef, useState } from "react";
import CanvasHeader from "./CanvasHeader";

export default function CanvasController() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokeWidth, setStrokeWidth] = useState(1);
  let drawing = false;
  function onEraserClicked() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(255,255,255,1)";
  }

  function onPenClicked() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = "rgba(0,0,0,1)";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const mouseDown = (e: globalThis.MouseEvent) => {
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.beginPath();
      context.moveTo(x, y);
      context.lineCap = "round";
      context.lineWidth = strokeWidth;
      context.stroke();
    };

    const mouseMove = (e: globalThis.MouseEvent) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.lineTo(x, y);
      context.stroke();
      context.moveTo(x, y);
    };

    const mouseUp = (e: globalThis.MouseEvent) => {
      drawing = false;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.lineTo(x, y);
      context.stroke();
      context.closePath();
    };

    canvas.addEventListener("mousemove", mouseMove);

    canvas.addEventListener("mousedown", mouseDown);

    canvas.addEventListener("mouseup", mouseUp);

    return () => {
      canvas.removeEventListener("mousemove", mouseMove);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
    };
  }, [strokeWidth]);

  return (
    <div className="border bg-white">
      <CanvasHeader
        onStrokeWidthChange={setStrokeWidth}
        value={strokeWidth}
        onEraserClicked={onEraserClicked}
        onPenClicked={onPenClicked}
      />
      <canvas ref={canvasRef} width="1920" height="1080" />
    </div>
  );
}
