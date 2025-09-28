// StageAnnotator.tsx
import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { ScaleProps } from "../types";
import { MiniMap } from "./Minimap";

/** Keep the same Box shape you originally used */
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

export const StageAnnotator = ({
  imageUrl,
  scale,
  setScale,
  labels,
  activeLabel,
  mode,
  boxes,
  setBoxes,
  selectedBoxIndex,
  setSelectedBoxIndex,
}: {
  imageUrl: string | undefined;
  scale: ScaleProps;
  setScale: (newVal: ScaleProps) => void;
  labels: { labelName: string; color: string }[];
  activeLabel: string | null;
  mode: "pan" | "draw" | "select";
  boxes: Box[];
  setBoxes: (b: Box[]) => void;
  selectedBoxIndex: number | null;
  setSelectedBoxIndex: (i: number | null) => void;
}) => {
  // --- refs & state ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  // shapeRefs are the Konva Rect nodes for attaching the transformer
  const shapeRefs = useRef<(Konva.Rect | null)[]>([]);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasDimension, setCanvasDimesion] = useState<{ width: number; height: number }>({
    width: 1040,
    height: 800,
  });
  const [drawing, setDrawing] = useState<boolean>(false);
  const [newBox, setNewBox] = useState<Box | null>(null);

  // --- Load image (preserve original behavior) ---
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      setBoxes([]); // reset boxes for new image (same as original)
      setScale({
        stage: 1,
        x: 0,
        y: 0,
        mPos: { x: 0, y: 0, sX: 0, sY: 0 },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // --- Fit canvas to container (use containerRef like original) ---
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const bounds = containerRef.current.getBoundingClientRect();
      setCanvasDimesion({ width: bounds.width, height: bounds.height });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Wheel zoom with pointer math & clamping (kept from your original) ---
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.02;
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    const minScale = .1;
    const maxScale = 10;
    newScale = Math.min(maxScale, Math.max(minScale, newScale));

    const mousePointTo = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };

    let newX = -(mousePointTo.x - pointer.x / newScale) * newScale;
    let newY = -(mousePointTo.y - pointer.y / newScale) * newScale;

    // Clamp boundaries
    if (image) {
      const scaledWidth = image.width * newScale;
      const scaledHeight = image.height * newScale;
      const stageWidth = canvasDimension.width;
      const stageHeight = canvasDimension.height;

      if (scaledWidth < stageWidth) newX = (stageWidth - scaledWidth) / 2;
      else newX = Math.min(0, Math.max(stageWidth - scaledWidth, newX));

      if (scaledHeight < stageHeight) newY = (stageHeight - scaledHeight) / 2;
      else newY = Math.min(0, Math.max(stageHeight - scaledHeight, newY));
    }

    setScale({
      stage: newScale,
      x: newX,
      y: newY,
      mPos: {
        x: pointer.x,
        y: pointer.y,
        sX: canvasDimension.width,
        sY: canvasDimension.height,
      },
    });
  };

  // --- Clamp Stage position on drag (preserve original behavior) ---
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage || !image) return;

    const scaledWidth = image.width * scale.stage;
    const scaledHeight = image.height * scale.stage;
    const stageWidth = canvasDimension.width;
    const stageHeight = canvasDimension.height;

    let x = stage.x();
    let y = stage.y();

    if (scaledWidth < stageWidth) x = (stageWidth - scaledWidth) / 2;
    else x = Math.min(0, Math.max(stageWidth - scaledWidth, x));

    if (scaledHeight < stageHeight) y = (stageHeight - scaledHeight) / 2;
    else y = Math.min(0, Math.max(stageHeight - scaledHeight, y));

    setScale({
      ...scale,
      x,
      y,
    });
  };

  // --- Drawing bounding boxes (coordinates stored in image-space, as original) ---
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Middle mouse = pan (start drag) — allow for middle-mouse panning regardless of mode
    if ((e.evt as MouseEvent).button === 1) {
      e.target.getStage()?.startDrag();
      return;
    }

    if (mode !== "draw" || !activeLabel) return; // only draw in draw mode with a label selected
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // convert pointer to image-space coordinates (same as your original)
    setDrawing(true);
    setNewBox({
      x: (pos.x - scale.x) / scale.stage,
      y: (pos.y - scale.y) / scale.stage,
      width: 0,
      height: 0,
      label: activeLabel,
      color: labels.find((l) => l.labelName === activeLabel)?.color || "red",
    });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    // if middle-mouse drag is happening, ignore drawing updates
    if ((e.evt as MouseEvent).buttons === 4) return;

    if (!drawing || !newBox) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setNewBox({
      ...newBox,
      width: (pos.x - scale.x) / scale.stage - newBox.x,
      height: (pos.y - scale.y) / scale.stage - newBox.y,
    });
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    // If middle mouse up, stop drag
    if ((e.evt as MouseEvent).button === 1) {
      try {
        e.target.getStage()?.stopDrag();
      } catch {
        // ignore if not available
      }
      return;
    }

    if (drawing && newBox) {
      // don't create tiny boxes
      if (Math.abs(newBox.width) > 3 && Math.abs(newBox.height) > 3) {
        setBoxes([...boxes, newBox]);
      }
    }

    setDrawing(false);
    setNewBox(null);
  };

  // --- Transformer attach/detach logic ---
  useEffect(() => {
    if (mode !== "select" || selectedBoxIndex === null) {
      // detach transformer
      trRef.current?.nodes([]);
      trRef.current?.getLayer()?.batchDraw();
      return;
    }

    const node = shapeRefs.current[selectedBoxIndex];
    if (node && trRef.current) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [mode, selectedBoxIndex, boxes]);

  // Helper to normalize rectangle when drawing preview (so negative width/height handled)
  const normRect = (b: { x: number; y: number; width: number; height: number }) => {
    const x = b.width < 0 ? b.x + b.width : b.x;
    const y = b.height < 0 ? b.y + b.height : b.y;
    const width = Math.abs(b.width);
    const height = Math.abs(b.height);
    return { x, y, width, height };
  };

  return (
    <section
      className="stage-wrap"
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <div className="stage-toolbar">
        <button
          className="btn"
          onClick={() =>
            setScale({
              stage: 1,
              x: 0,
              y: 0,
              mPos: { x: 0, y: 0, sX: 0, sY: 0 },
            })
          }
        >
          Original
        </button>
        <div className="btn">{`${Math.ceil(scale.stage * 100)}%`}</div>
      </div>

      <Stage
        ref={stageRef}
        width={canvasDimension.width}
        height={canvasDimension.height}
        scaleX={scale.stage}
        scaleY={scale.stage}
        x={scale.x}
        y={scale.y}
        draggable={mode === "pan"} // pan only when in pan mode; middle-mouse drag also triggers startDrag
        onWheel={handleWheel}
        onDragMove={handleDragMove}
        onMouseDown={(e) => {
          // middle mouse handled inside handleMouseDown
          handleMouseDown(e);
        }}
        onMouseMove={(e) => {
          // keep behavior same as original: only call drawing handlers when in draw mode
          if (mode === "draw") handleMouseMove(e);
        }}
        onMouseUp={(e) => {
          if (mode === "draw") handleMouseUp(e);
          else {
            // always handle middle mouse up to stop drag
            if ((e.evt as MouseEvent).button === 1) {
              try {
                e.target.getStage()?.stopDrag();
              } catch {
                // ignore
              }
            }
          }
        }}
      >
        <Layer>
          {image && <KonvaImage image={image} width={image.width} height={image.height} />}

          {/* Render saved boxes (image-space coords) */}
          {boxes.map((b, i) => {
            // For rendering, we render b.x/b.y/b.width/b.height directly (image-space)
            const isSelected = selectedBoxIndex === i;
            return (
              <Rect
                key={i}
                ref={(el) => (shapeRefs.current[i] = el as Konva.Rect | null)}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
                stroke={b.color}
                strokeWidth={isSelected ? 3 : 2}
                dash={isSelected ? [6, 3] : undefined}
                onClick={() => {
                  if (mode === "select") {
                    setSelectedBoxIndex(i);
                  }
                }}
                draggable={mode === "select" && isSelected} // allow move only when in select and selected
                onDragEnd={(e) => {
                  const { x, y } = e.target.position();
                  const updated = [...boxes];
                  updated[i] = { ...updated[i], x, y };
                  setBoxes(updated);
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  // new width/height after transform (account for node scale)
                  const newW = node.width() * node.scaleX();
                  const newH = node.height() * node.scaleY();

                  // update box with new size & position
                  const updated = [...boxes];
                  updated[i] = {
                    ...updated[i],
                    x: node.x(),
                    y: node.y(),
                    width: newW,
                    height: newH,
                  };

                  // reset node scale so future transforms are correct
                  node.scaleX(1);
                  node.scaleY(1);

                  setBoxes(updated);
                }}
              />
            );
          })}

          {/* Preview new box while drawing (normalize to allow drag in any direction) */}
          {newBox && (
            (() => {
              const p = normRect(newBox);
              return (
                <Rect
                  x={p.x}
                  y={p.y}
                  width={p.width}
                  height={p.height}
                  stroke={newBox.color}
                  dash={[4, 2]}
                />
              );
            })()
          )}

          {/* Transformer (only attached to selected node via effect above) */}
          <Transformer
            ref={trRef}
            rotateEnabled={false} // like Label Studio — no rotation
            keepRatio={false} // allow free aspect ratio changes
            boundBoxFunc={(oldBox, newBox) => {
              // prevent zero/negative tiny sizes
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Keep MiniMap exactly as you originally had it (no prop-change) */}
      <MiniMap image={image} scale={scale} />
    </section>
  );
};
