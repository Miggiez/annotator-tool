import React, { useState, useCallback, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import "./App.css";
import type { AnnotatorProps } from "./features/annotation/component/types";
import Konva from "konva";
import {
	ArrowLeft,
	ArrowRight,
	CrossIcon,
	Download,
	Edit2,
	Save,
	Trash2,
} from "lucide-react";
import { Stage, Layer } from "react-konva";
import { ImageFromUrl } from "./features/annotation/component/ImageFromUrl";
import { Annotator } from "./features/annotation/component/Annotator";
import image1 from "./assets/2024-05-24_Doge_meme_death_-_Hero.jpg";
import image2 from "./assets/doge.jpg";

function App() {
	const [images, setImages] = useState<string[]>([image1, image2]);
	const [annotations, setAnnotations] = useState<AnnotatorProps[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [newAnnotation, setNewAnnotation] = useState<AnnotatorProps[]>([]);
	const [selectedId, selectAnnotation] = useState<string | null>(null);
	const [annotationMode, setAnnotationMode] = useState<boolean>(false);
	const [annotationSaved, setAnnotationSaved] = useState<boolean>(false);
	const [annotationsToDraw, setAnnotationsToDraw] = useState<AnnotatorProps[]>(
		[],
	);

	useEffect(() => {
		const updatedAnnotationsToDraw = [...annotations, ...newAnnotation];
		setAnnotationsToDraw(updatedAnnotationsToDraw);
	}, [annotations, newAnnotation]);

	// Toggle annotation mode between enable and disable
	const handleAnnotationButtonClick = () => {
		setAnnotationMode((prevMode) => !prevMode);
	};

	const [canvasMeasures, setCanvasMeasures] = useState<{
		width: number;
		height: number;
	}>({
		width: 800, // Set canvas width
		height: 400, // Set canvas height
	});

	// Handle mouse down event for creating a new annotation
	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		if (annotationMode && selectedId === null && newAnnotation) {
			const pointer = e.target.getStage()?.getPointerPosition();
			if (!pointer) return;
			const { x, y } = pointer;
			const id = uuidV4();
			setNewAnnotation([{ x, y, width: 0, height: 0, id, strokeRect: "red" }]);
		}
	};

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
		if (selectedId === null && newAnnotation.length === 1) {
			const sx = newAnnotation[0].x;
			const sy = newAnnotation[0].y;
			const pointer = e.target.getStage()?.getPointerPosition();
			if (!pointer) return;
			const { x, y } = pointer;
			const id = uuidV4();
			setNewAnnotation([
				{
					x: sx,
					y: sy,
					width: x - sx,
					height: y - sy,
					id,
					strokeRect: "red",
				},
			]);
		}
	};

	// Handle mouse up event for finalizing the new annotation
	const handleMouseUp = () => {
		if (selectedId === null && newAnnotation) {
			const newAnnotationData = newAnnotation[0];
			if (
				newAnnotationData.x !== newAnnotationData.x + newAnnotationData.width ||
				newAnnotationData.y !== newAnnotationData.y + newAnnotationData.height
			) {
				setAnnotations((prev) => [...prev, newAnnotationData]);
			}
			setNewAnnotation([]);
		}
	};

	// Handle mouse enter event for changing cursor
	const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.target.getStage()!.container().style.cursor = "crosshair";
	};

	// Handle key down event for deleting selected annotation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === "Backspace" || e.code === "Period") {
			if (selectedId !== null) {
				const newAnnotations = annotations?.filter(
					(annotation) => annotation.id !== selectedId,
				);
				setAnnotations(newAnnotations);
			}
		}
	};

	// function to go to previous image
	const handlePreviousImage = () => {
		if (currentImageIndex > 0) {
			setCurrentImageIndex(currentImageIndex - 1);
			handleClearButtonClick();
		}
	};

	// function to go to next image
	const handleNextImage = () => {
		if (currentImageIndex < images.length - 1) {
			setCurrentImageIndex(currentImageIndex + 1);
			handleClearButtonClick();
		}
	};

	// functions to generate annotation json data
	const generateAnnotationsJSON = useCallback(() => {
		const annotationsJSON: any = {};
		const currentImage: string = images[currentImageIndex];
		annotationsJSON[currentImage] = annotations.map((annotation) => ({
			x1: annotation.x,
			y1: annotation.y,
			x2: annotation.x + annotation.width,
			y2: annotation.y + annotation.height,
		}));
		return JSON.stringify(annotationsJSON);
	}, [annotations, currentImageIndex]);

	// function to save annotation json data
	const handleSaveButtonClick = () => {
		const annotationsString = generateAnnotationsJSON();
		console.log(annotationsString); // Display the JSON string
		setAnnotationSaved(true);
	};

	// function to clear annotations
	const handleClearButtonClick = () => {
		setAnnotations([]); // Clear all annotations by setting the state to an empty array
		selectAnnotation(null); // Clear the selected annotation as well
		setNewAnnotation([]); // Clear the newAnnotation state
		setAnnotationSaved(false);
	};

	// function to download annotation json data
	const handleDownloadAnnotations = () => {
		if (annotationSaved) {
			if (annotations.length > 0) {
				const annotationsString = generateAnnotationsJSON();
				const blob = new Blob([annotationsString], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);

				const a = document.createElement("a");
				a.href = url;
				a.download = "annotations.json";
				a.click();

				URL.revokeObjectURL(url);
				setAnnotationSaved(false);
			} else {
				alert("No annotations to submit.");
			}
		} else {
			alert("Please save before submitting annotations");
		}
	};

	return (
		<>
			<div className="button-container">
				<button className="btn" onClick={handlePreviousImage}>
					<span className="icon">
						<ArrowLeft />
					</span>
					<span className="text">Previous</span>
				</button>
				<button className="btn" onClick={handleAnnotationButtonClick}>
					{annotationMode ? (
						<>
							<span className="icon">
								<CrossIcon />
							</span>{" "}
							<span className="text">Disable Annotation</span>
						</>
					) : (
						<>
							<span className="icon">
								<Edit2 />
							</span>
							<span className="text">Enable Annotation</span>
						</>
					)}
				</button>

				<button className="btn" onClick={handleSaveButtonClick}>
					<span className="icon">
						<Save />
					</span>
					<span className="text">Save</span>
				</button>
				<button className="btn" onClick={handleDownloadAnnotations}>
					<span className="icon">
						<Download />
					</span>
					<span className="text">Submit</span>
				</button>
				<button className="btn" onClick={handleClearButtonClick}>
					<span className="icon">
						<Trash2 />
					</span>
					<span className="text">Clear</span>
				</button>
				<button className="btn" onClick={handleNextImage}>
					<span className="text">Next</span>
					<span className="icon">
						<ArrowRight />
					</span>
				</button>
			</div>

			<div
				className="canvasContainer"
				tabIndex={1}
				onKeyDown={(e) => handleKeyDown(e)}
			>
				<Stage
					width={canvasMeasures.width}
					height={canvasMeasures.height}
					onMouseEnter={handleMouseEnter}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					style={{ border: "2px solid #3054e5" }}
				>
					<Layer>
						<ImageFromUrl
							setCanvasMeasures={setCanvasMeasures}
							canvasMeasures={canvasMeasures}
							imageUrl={images[currentImageIndex]}
							onMouseDown={() => {
								selectAnnotation(null);
							}}
						/>
						{annotationsToDraw.map((annotation, i) => {
							return (
								<Annotator
									key={i}
									shapeProps={annotation}
									isSelected={annotation.id === selectedId}
									onSelect={() => {
										selectAnnotation(annotation.id);
									}}
									onChange={(newAttrs) => {
										const rects = annotations.slice();
										rects[i] = newAttrs;
										setAnnotations(rects);
									}}
								/>
							);
						})}
					</Layer>
				</Stage>
			</div>
		</>
	);
}

export default App;
