export type AnnotatorProps = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	strokeRect: string;
};

export type AnnotationLabel = {
	id: string;
	name: string;
	description: string;
	notes?: string;
};

export type CanvaMeasureProps = {
	width: number;
	height: number;
};

export type AnnotationJSON = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};
