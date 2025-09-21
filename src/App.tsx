import { useState } from "react";
import { Topbar } from "./components/Topbar";
import { ToolsPanel } from "./components/ToolsPanel";
import { NotesPanel } from "./components/NotesPanel";
import { Footer } from "./components/Footer";
import "./App.css";
import type { ImageProps } from "./types";
import { StageAnnotator } from "./components/StageAnnotator";

function App() {
	const [images, setImages] = useState<ImageProps[]>([]);
	const [pageCounter, setPageCounter] = useState<number>(0);
	const [scale, setScale] = useState<{ stage: number; x: number; y: number }>({
		stage: 1,
		x: 1,
		y: 1,
	});
	return (
		<div className="app">
			<Topbar
				setImages={setImages}
				images={images}
				pageCounter={pageCounter}
				setPageCounter={setPageCounter}
			/>
			<main className="main">
				<ToolsPanel />
				<StageAnnotator
					imageUrl={images[pageCounter]?.src}
					scale={scale}
					setScale={setScale}
				/>
				<NotesPanel />
			</main>
			<Footer />
		</div>
	);
}

export default App;
