import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useEffect } from "react";
import { Image, Layer, Stage } from "react-konva";
import type { ScaleProps } from "../types";
import { MiniMap } from "./Minimap";

export const StageAnnotator = ({
	imageUrl,
	scale,
	setScale,
}: {
	imageUrl: string | undefined;
	scale: ScaleProps;
	setScale: (newVal: ScaleProps) => void;
}) => {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [canvasDimension, setCanvasDimesion] = useState<{
		width: number;
		height: number;
	}>({
		width: 1040,
		height: 800,
	});

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const scaleBy = 1.02;
		const stage = e.target.getStage();
		const oldScale = stage?.scaleX();
		const pointerXPosition = stage?.getPointerPosition()?.x;
		const pointerYPosition = stage?.getPointerPosition()?.y;
		if (
			oldScale === undefined ||
			!stage ||
			pointerXPosition === undefined ||
			pointerYPosition === undefined
		)
			return;

		const mousePointTo = {
			x: pointerXPosition / oldScale - stage.x() / oldScale,
			y: pointerYPosition / oldScale - stage.y() / oldScale,
		};

		const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

		setScale({
			stage: newScale,
			x: -(mousePointTo.x - pointerXPosition / newScale) * newScale,
			y: -(mousePointTo.y - pointerYPosition / newScale) * newScale,
			mPos: {
				x: pointerXPosition,
				y: pointerYPosition,
				sX: canvasDimension.width,
				sY: canvasDimension.height,
			},
		});
	};

	useEffect(() => {
		const imageToLoad = new window.Image();
		if (imageUrl !== undefined) {
			imageToLoad.src = imageUrl;
		}

		const handleLoad = () => {
			let newWidth = imageToLoad.width;
			let newHeight = imageToLoad.height;

			// Update the canvas dimensions using the provided callback
			setCanvasDimesion({
				width: newWidth,
				height: newHeight,
			});
			setImage(imageToLoad);
			setScale({
				stage: 1,
				x: 0,
				y: 0,
				mPos: { x: 0, y: 0, sX: 0, sY: 0 },
			});
		};

		imageToLoad.addEventListener("load", handleLoad);
		return () => {
			imageToLoad.removeEventListener("load", handleLoad);
		};
	}, [imageUrl, setCanvasDimesion]);

	return (
		<section className="stage-wrap">
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
				<div className="btn">
					<span>{`${Math.ceil(scale.stage * 100)}%`}</span>
				</div>
			</div>
			<Stage
				width={canvasDimension?.width}
				onWheel={handleWheel}
				height={canvasDimension?.height}
				scaleX={scale.stage}
				scaleY={scale.stage}
				x={scale.x}
				y={scale.y}
				draggable
				onDragMove={(e) => {
					const stage = e.target;
					const positionX = stage?.getStage()?.x();
					const positionY = stage?.getStage()?.y();
					if (positionX === undefined || positionY === undefined) return;
					setScale({
						...scale,
						x: positionX,
						y: positionY,
					});
				}}
			>
				<Layer>
					{image && image !== undefined ? (
						<Image
							image={image}
							width={canvasDimension?.width}
							height={canvasDimension?.height}
						/>
					) : (
						""
					)}
				</Layer>
			</Stage>
			<MiniMap image={image} scale={scale} />
		</section>
	);
};
