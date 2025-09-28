import { useState } from "react";
import type { Box } from "../App";

type Mode = "pan" | "draw" | "select";

export const ToolsPanel = ({
  selectedLabel,
  setSelectedLabel,
  mode,
  setMode,
  boxes,
  setBoxes,
  selectedBoxIndex,
  setSelectedBoxIndex,
}: {
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  boxes: Box[];
  setBoxes: (b: Box[]) => void;
  selectedBoxIndex: number | null;
  setSelectedBoxIndex: (i: number | null) => void;
}) => {
  const [labelName, setLabelName] = useState<string>("");
  const [color, setColor] = useState<string>("#ef4444");
  const [labels, setLabels] = useState<{ labelName: string; color: string }[]>([]);

  const handleAddLabel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (labelName.trim() !== "") {
      const newLabel = { labelName: labelName.trim(), color };
      setLabels((prev) => [...prev, newLabel]);
      setLabelName("");
      setSelectedLabel(newLabel.labelName);
    }
  };

  const handleRemoveLabel = (index: number) => {
    setLabels((prev) => prev.filter((_, i) => i !== index));
    if (labels[index]?.labelName === selectedLabel) {
      setSelectedLabel(null);
    }
  };

  const handleUseLabel = (label: { labelName: string; color: string }) => {
    setSelectedLabel(label.labelName);
    setMode("draw");
  };

  return (
    <section className="panel">
      <div className="head">Tools</div>
      <div className="body">
        <div className="tools">
          <button className={`tool-btn ${mode === "draw" ? "active" : ""}`} onClick={() => setMode("draw")}>📦 Bounding Box</button>
          <button className={`tool-btn ${mode === "pan" ? "active" : ""}`} onClick={() => setMode("pan")}>✋ Pan / Zoom</button>
          <button className={`tool-btn ${mode === "select" ? "active" : ""}`} onClick={() => setMode("select")}>🖱 Select / Move</button>
        </div>

        <hr />

        <div className="head">Labels</div>
        <div id="labels">
          {labels.map((label, i) => (
            <div key={i} className="label-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="dot" style={{ backgroundColor: label.color, width: 16, height: 16, borderRadius: "50%", border: selectedLabel === label.labelName ? "2px solid #fff" : "1px solid #0005" }} />
                {label.labelName}
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                <button className="btn" onClick={() => handleUseLabel(label)} title="Use label">Use</button>
                <button className="btn destructive" onClick={() => handleRemoveLabel(i)} title="Remove label">Remove</button>
              </span>
            </div>
          ))}
        </div>

        <div className="add-label flex items-center gap-2">
          <input value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Add label e.g. Person" />
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <button onClick={handleAddLabel} className="btn">Add</button>
        </div>

        <hr />

        <div className="head">Annotations</div>
        <div id="annotations">
          {boxes.map((b, i) => (
            <div key={i} className={`anno-row ${selectedBoxIndex === i ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="dot" style={{ backgroundColor: b.color, width: 14, height: 14, borderRadius: "50%" }} />
                {b.label}
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                <button className="btn" onClick={() => setSelectedBoxIndex(i)}>Select</button>
                <button className="btn destructive" onClick={() => {
                  setBoxes(boxes.filter((_, idx) => idx !== i));
                  if (selectedBoxIndex === i) setSelectedBoxIndex(null);
                }}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
