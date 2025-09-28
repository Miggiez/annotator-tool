import React from "react";
import type { ImageProps } from "../types";
import type { Box } from "../App";

export const Topbar = ({
  setImages,
  images,
  setPageCounter,
  pageCounter,
  boxes,
  setBoxes,
  setSelectedShape, // if you track selected shapes
}: {
  setImages: (newVal: ImageProps[]) => void;
  images: ImageProps[];
  setPageCounter: (newVal: number) => void;
  pageCounter: number;
  boxes: Box[];
  setBoxes: (b: Box[]) => void;
  setSelectedShape?: (s: Box | null) => void;
}) => {

  const handleNextPage = () => {
    setPageCounter(Math.min(images.length - 1, pageCounter + 1));
  };

  const handlePrevPage = () => {
    setPageCounter(Math.max(0, pageCounter - 1));
  };

  const handleClear = () => {
    setBoxes([]); // Clear all boxes
    if (setSelectedShape) setSelectedShape(null); // Reset selection if used
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(boxes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Box[];
        const normalized = parsed.map(b => ({
          x: b.x,
          y: b.y,
          width: Math.abs(b.width),
          height: Math.abs(b.height),
          label: b.label,
          color: b.color || "red",
        }));
        setBoxes(normalized);
      } catch (err) {
        console.error("Invalid import file", err);
        alert("Invalid JSON file for annotations.");
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageProps[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          newImages.push({
            src: reader.result as string,
            w: img.naturalWidth,
            h: img.naturalHeight,
            name: file.name,
          });
          if (newImages.length === files.length) {
            setImages([...images, ...newImages]);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <header className="topbar">
      <div className="logo" title="ViewerAI">
        <span>DicomBuild</span>
      </div>
      <div className="top-actions ml-auto flex gap-3 items-center">
        {images.length > 0 && (
          <>
            <button className="btn" onClick={handlePrevPage}>Previous</button>
            <label>{pageCounter + 1} / {images.length}</label>
            <button className="btn" onClick={handleNextPage}>Next</button>
          </>
        )}
        <label className="btn">
          <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          <span>Open Images</span>
        </label>
        <label className="btn">
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={handleImport} />
          <span>Import</span>
        </label>
        <button className="btn primary" onClick={handleExport}>Export</button>
        <button className="btn destructive" onClick={handleClear}>Clear</button>
      </div>
    </header>
  );
};
