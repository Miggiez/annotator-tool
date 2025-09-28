import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Rect } from "react-konva";
import type { ScaleProps } from "../types";

export const MiniMap = ({
  scale,
  image,
}: {
  scale: ScaleProps;
  image: HTMLImageElement | null;
}) => {
  if (!image) return null;

  // --- Draggable state ---
  const [position, setPosition] = useState({ top: 10, left: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.left, y: e.clientY - position.top };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        left: e.clientX - dragStart.current.x,
        top: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // --- Resizable state ---
  const [size, setSize] = useState({ width: 200, height: 150 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ width: 0, height: 0, mouseX: 0 });

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { width: size.width, height: size.height, mouseX: e.clientX };
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.current.mouseX;
    const newWidth = resizeStart.current.width + deltaX;
    const newHeight = (image.height / image.width) * newWidth;

    if (newWidth > 50 && newHeight > 50) setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeMouseUp = () => setIsResizing(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [isResizing]);

  // --- Viewport rectangle ---
  const scaleX = image.width / size.width;
  const scaleY = image.height / size.height;

  const rectX = -scale.x / scale.stage / scaleX;
  const rectY = -scale.y / scale.stage / scaleY;
  const rectW = scale.mPos.sX / scale.stage / scaleX;
  const rectH = scale.mPos.sY / scale.stage / scaleY;

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: size.width,
        height: size.height,
        border: "1px solid gray",
        background: "#eee",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <Stage width={size.width} height={size.height}>
        <Layer>
          <Image image={image} width={size.width} height={size.height} />
          <Rect
            x={rectX}
            y={rectY}
            width={rectW}
            height={rectH}
            stroke="red"
            strokeWidth={2}
          />
        </Layer>
      </Stage>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 10,
          height: 10,
          background: "red",
          cursor: "se-resize",
        }}
      />
    </div>
  );
};
