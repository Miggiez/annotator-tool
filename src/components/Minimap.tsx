import { Layer, Stage, Image, Rect } from "react-konva";
import type { ScaleProps } from "../types";

export const MiniMap = ({
	scale,
	image,
}: {
	scale: ScaleProps;
	image: HTMLImageElement | null;
}) => {
	if (!image) return;
	const cScale = 5;
	const width = image?.width / cScale;
	const height = image?.width / cScale;
	const recW = scale.mPos.sX / scale.stage / cScale;
	const recH = scale.mPos.sY / scale.stage / cScale;

	const mXPos = -scale.x / scale.stage / cScale;
	const mYPos = -scale.y / scale.stage / cScale;

	return (
		<div
			className={`absolute top-[2px] right-[2px] border border-gray-50 bg-gray-400`}
		>
			<p>
				mX: {mXPos} ; my: {mYPos}
			</p>
			<Stage width={width} height={height} scaleX={1} scaleY={1}>
				{image ? (
					<Layer>
						<Image image={image} width={width} height={height} />
						<Rect
							x={mXPos}
							y={mYPos}
							width={recW}
							height={recH}
							stroke={"red"}
						/>
					</Layer>
				) : (
					""
				)}
			</Stage>
		</div>
	);
};
