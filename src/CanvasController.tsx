//The Canvas Controller that manages the whiteboard.

import { useEffect, useRef, useState } from "react";
import CanvasHeader from "./CanvasHeader";
import { socket } from "./socket";

interface Stroke {
  color:
    | {
        r: number;
        g: number;
        b: number;
        a: number;
      }
    | "eraser";
  points: [number, number][];
  width: number;
}

export default function CanvasController({
  connected,
}: {
  connected: boolean;
}) {
  /* Reference to the Canvas element which we use to draw */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* The current selected stroke width */
  const [strokeWidth, setStrokeWidth] = useState(1);

  const [color, setColor] = useState({ r: 0, g: 0, b: 0 });

  /* The current selected tool */
  const [tool, setTool] = useState<"eraser" | "pen">("pen");

  let drawing = false;
  function onEraserClicked() {
    setTool("eraser");
  }

  function onPenClicked() {
    setTool("pen");
  }

  function onColorChanged(v: string) {
    const newColor = {
      r: parseInt(v.substring(1, 3), 16),
      g: parseInt(v.substring(3, 5), 16),
      b: parseInt(v.substring(5), 16),
    };
    setColor(newColor);
  }

  /* Logic for drawing events and socket emissions. */
  useEffect(() => {
    /* Grab the canvas references */
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    /* Storage for current stroke points and a list of buffering lines, which are yet to be drawn on screen. */
    let currentStroke: [number, number][] = [];
    let bufferingLines: Stroke[] = [];

    /* Start drawing */
    const mouseDown = (e: globalThis.MouseEvent) => {
      drawing = true;
      const rect = canvas.getBoundingClientRect();

      // Get the X & Y
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Switch the color based on the tool
      switch (tool) {
        case "pen":
          context.globalCompositeOperation = "source-over";
          context.strokeStyle = `rgba(${color.r},${color.g},${color.b},1)`;
          break;
        case "eraser":
          context.globalCompositeOperation = "destination-out";
          context.strokeStyle = "rgba(255,255,255,1)";
          break;
      }

      console.log(`rgba(${color.r},${color.g},${color.b},1)`);

      // Begin drawing and set the required values
      currentStroke = [];
      context.beginPath();
      context.moveTo(x, y);
      currentStroke.push([x, y]);
      context.lineCap = "round";
      context.lineWidth = strokeWidth;
      context.stroke();
    };

    // Keep drawing
    const mouseMove = (e: globalThis.MouseEvent) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.lineTo(x, y);
      context.stroke();
      context.moveTo(x, y);
      currentStroke.push([x, y]);
    };

    // Finish a stroke
    const mouseUp = (e: globalThis.MouseEvent) => {
      drawing = false;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.lineTo(x, y);
      currentStroke.push([x, y]);
      context.stroke();
      context.closePath();

      // Emit the stroke to the server when done.
      socket.emit("drawline", {
        color:
          tool == "pen"
            ? { r: color.r, g: color.g, b: color.b, a: 1 }
            : "eraser",
        points: currentStroke,
        width: strokeWidth,
      });

      // We draw all the buffering lines after finishing the line currently being drawn, that way
      // the order of the lines remains consistent over clients
      for (const stroke of bufferingLines) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.lineCap = "round";
        context.lineWidth = stroke.width;
        if (stroke.color === "eraser") {
          context.globalCompositeOperation = "destination-out";
          context.strokeStyle = "rgba(255,255,255,1)";
        } else {
          const c = stroke.color;
          context.globalCompositeOperation = "source-over";
          context.strokeStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
        }
        context.strokeStyle;
        context.beginPath();
        context.moveTo(stroke.points[0][0], stroke.points[0][1]);
        context.stroke();
        for (let i = 1; i < stroke.points.length; i++) {
          const [x, y] = stroke.points[i];
          context.lineTo(x, y);
          context.stroke();
          context.moveTo(x, y);
        }
        context.closePath();
      }
      bufferingLines = [];
      currentStroke = [];
    };

    canvas.addEventListener("mousemove", mouseMove);

    canvas.addEventListener("mousedown", mouseDown);

    canvas.addEventListener("mouseup", mouseUp);

    // If we are not currently drawing, draw an emitted line immediately.
    function onLineDrawn(stroke: Stroke) {
      console.log(stroke);
      if (currentStroke.length == 0) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.lineCap = "round";
        context.lineWidth = stroke.width;
        if (stroke.color === "eraser") {
          context.globalCompositeOperation = "destination-out";
          context.strokeStyle = "rgba(255,255,255,1)";
        } else {
          const c = stroke.color;
          context.globalCompositeOperation = "source-over";
          context.strokeStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
        }
        context.beginPath();
        context.moveTo(stroke.points[0][0], stroke.points[0][1]);
        context.stroke();
        for (let i = 1; i < stroke.points.length; i++) {
          const [x, y] = stroke.points[i];
          context.lineTo(x, y);
          context.stroke();
          context.moveTo(x, y);
        }
        context.closePath();
      } else {
        bufferingLines.push(stroke);
      }
    }

    socket.on("linedrawn", onLineDrawn);

    return () => {
      canvas.removeEventListener("mousemove", mouseMove);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      socket.off("linedrawn", onLineDrawn);
    };
  }, [strokeWidth, tool, color]);

  return (
    <div className="border bg-white">
      <CanvasHeader
        onStrokeWidthChange={setStrokeWidth}
        value={strokeWidth}
        onColorChanged={onColorChanged}
        colorValue={`#${Math.floor(color.r).toString(16)}${Math.floor(color.g).toString(16)}${Math.floor(color.b).toString(16)}`}
        onEraserClicked={onEraserClicked}
        onPenClicked={onPenClicked}
        tool={tool}
        connected={connected}
      />
      <canvas ref={canvasRef} width="1920" height="1080" />
    </div>
  );
}
