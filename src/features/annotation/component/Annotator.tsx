import type { AnnotatorProps } from "./types";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Rect, Transformer } from "react-konva";

export const Annotator = ({
	shapeProps,
	isSelected,
	onSelect,
	onChange,
}: {
	shapeProps: AnnotatorProps;
	isSelected: boolean;
	onSelect: () => void;
	onChange: (newVal: AnnotatorProps) => void;
}) => {
	const rectRef = useRef<Konva.Rect>(null);
	const trRef = useRef<Konva.Transformer>(null);
	const [isDraggable, setIsDraggable] = useState<boolean>(false);

	useEffect(() => {
		if (isSelected) {
			setIsDraggable(true);
			if (trRef && rectRef.current) {
				trRef.current!.nodes([rectRef.current]);
				trRef.current?.getLayer()?.batchDraw();
			}
		} else {
			setIsDraggable(false);
		}
	}, [isSelected]);

	const onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
		if (!e) return;
		e.target.getStage()!.container().style.cursor = "move";
	};

	const onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
		if (!e) return;
		e.target.getStage()!.container().style.cursor = "crosshair";
	};

	return (
		<>
			<Rect
				fill="transparent"
				stroke="blue"
				onMouseDown={onSelect}
				ref={rectRef}
				{...shapeProps}
				strokeScaleEnabled={false}
				draggable={isDraggable}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onDragEnd={(e) => {
					onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
				}}
				onTransformEnd={(_) => {
					const node = rectRef.current;
					if (!node) return;

					const scaleX = node.scaleX();
					const scaleY = node.scaleY();
					node.scaleX(1);
					node.scaleY(1);
					onChange({
						...shapeProps,
						x: node.x(),
						y: node.y(),
						width: Math.max(5, node.width() * scaleX),
						height: Math.max(node.height() * scaleY),
					});
				}}
			/>
			{isSelected && (
				<Transformer
					ref={trRef}
					flipEnabled={false}
					boundBoxFunc={(oldBox, newBox) => {
						// limit resize
						if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
							return oldBox;
						}
						return newBox;
					}}
				/>
			)}
		</>
	);
};
