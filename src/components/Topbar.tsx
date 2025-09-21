import React from "react";
import type { ImageProps } from "../types";

export const Topbar = ({
	setImages,
	images,
	setPageCounter,
	pageCounter,
}: {
	setImages: (newVal: ImageProps[]) => void;
	images: ImageProps[];
	setPageCounter: (newVal: number) => void;
	pageCounter: number;
}) => {
	const handleNextPageCounter = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		if (pageCounter < images.length - 1) {
			setPageCounter(pageCounter + 1);
		}
	};

	const handlePrevPageCounter = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		if (pageCounter > 0) {
			setPageCounter(pageCounter - 1);
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.files;
		if (!input) return;
		const files = Array.from(input || []);
		const newPreviews: ImageProps[] = [];

		files.forEach((file) => {
			const reader = new FileReader();

			reader.onload = () => {
				const base64 = reader.result as string;
				const image = new Image();
				image.onload = () => {
					newPreviews.push({
						src: base64,
						w: image.naturalWidth,
						h: image.naturalHeight,
						name: file.name,
					});
					if (newPreviews.length === files.length) {
						setImages(newPreviews);
					}
				};
				image.src = base64;
			};
			reader.readAsDataURL(file);
		});
	};
	return (
		<header className="topbar">
			<div className="logo" title="ViewerAI">
				<span>DicomBuild</span>
			</div>
			<div className="top-actions">
				<div
					className={`mx-10 flex gap-3 items-center ${images.length !== 0 ? "block" : "hidden"}`}
				>
					<button onClick={handlePrevPageCounter} className="btn">
						Previous
					</button>
					<label>
						{pageCounter + 1} / {images.length}
					</label>
					<button onClick={handleNextPageCounter} className="btn">
						Next
					</button>
				</div>
				<label className="btn">
					<input
						onChange={handleFileChange}
						multiple
						type="file"
						accept="image/*"
						style={{ display: "none" }}
					/>
					<span>Open Image</span>
				</label>
				<button className="btn">Import</button>
				<button className="btn primary">Export</button>
				<button className="btn destructive">Clear</button>
			</div>
		</header>
	);
};
