import { useState, useEffect } from "react";
import { Topbar } from "./components/Topbar";
import { ToolsPanel } from "./components/ToolsPanel";
import { NotesPanel } from "./components/NotesPanel";
import { Footer } from "./components/Footer";
import "./App.css";
import type { ImageProps, ScaleProps } from "./types";
import { StageAnnotator } from "./components/StageAnnotator";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

function App() {
  const [images, setImages] = useState<ImageProps[]>([]);
  const [pageCounter, setPageCounter] = useState<number>(0);

  const [scale, setScale] = useState<ScaleProps>({
    stage: 1,
    x: 0,
    y: 0,
    mPos: { x: 0, y: 0, sX: 0, sY: 0 },
  });

  const [mode, setMode] = useState<"pan" | "draw" | "select">("pan");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  // 🔹 Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBoxIndex !== null) {
          setBoxes((prev) => prev.filter((_, i) => i !== selectedBoxIndex));
          setSelectedBoxIndex(null);
        }
      }
      if (e.key.toLowerCase() === "v") setMode("select"); // V = Select
      if (e.key.toLowerCase() === "b") setMode("draw");   // B = Box (Draw)
      if (e.code === "Space") setMode("pan");             // Space = Pan
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedBoxIndex]);

  return (
    <div className="app">
      <Topbar
        setImages={setImages}
        images={images}
        pageCounter={pageCounter}
        setPageCounter={setPageCounter}
        boxes={boxes}          // pass boxes
        setBoxes={setBoxes}    // pass setBoxes
      />
      <main className="main">
        <ToolsPanel
          selectedLabel={activeLabel}
          setSelectedLabel={setActiveLabel}
          mode={mode}
          setMode={setMode}
          boxes={boxes}
          setBoxes={setBoxes}
          selectedBoxIndex={selectedBoxIndex}
          setSelectedBoxIndex={setSelectedBoxIndex}
        />
        <StageAnnotator
          imageUrl={images[pageCounter]?.src}
          scale={scale}
          setScale={setScale}
          labels={[]} // labels managed inside ToolsPanel
          activeLabel={activeLabel}
          mode={mode}
          boxes={boxes}
          setBoxes={setBoxes}
          selectedBoxIndex={selectedBoxIndex}
          setSelectedBoxIndex={setSelectedBoxIndex}
        />
        <NotesPanel />
      </main>
      <Footer />
    </div>
  );
}

export default App;
