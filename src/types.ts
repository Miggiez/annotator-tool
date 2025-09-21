export type ImageProps = {
	src: string | undefined;
	name: string;
	w: number;
	h: number;
};

export type ScaleProps = {
	stage: number;
	x: number;
	y: number;
	mPos: { x: number; y: number; sX: number; sY: number };
};
