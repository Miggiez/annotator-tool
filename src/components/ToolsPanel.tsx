import { useState } from "react";

export const ToolsPanel = () => {
	const [labelName, setLabelName] = useState<string>("");
	const [color, setColor] = useState<string>("#ef4444");
	const [labels, setLabels] = useState<{ labelName: string; color: string }[]>(
		[],
	);

	const handleAddLabel = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (labelName !== "") {
			setLabels((prev) => [...prev, { labelName: labelName, color: color }]);
			setLabelName("");
		}
	};

	return (
		<section className="panel">
			<div className="head">Tools</div>
			<div className="body">
				<div className="tools">
					<button className="tool-btn active">📦 Bounding Box</button>
					<button className="tool-btn">✋ Pan / Zoom</button>
					<button className="tool-btn">🖱 Select / Move</button>
				</div>
				<hr />
				<div className="head">Labels</div>
				<div id="labels">
					{labels.map((label, i) => (
						<li key={i}>
							{label.labelName} | {label.color}
						</li>
					))}
				</div>
				<div className="add-label">
					<input
						value={labelName}
						onChange={(e) => setLabelName(e.target.value)}
						placeholder="Add label e.g. Person"
					/>
					<input
						onChange={(e) => setColor(e.target.value)}
						type="color"
						value={color}
					/>
					<button onClick={handleAddLabel} className="btn">
						Add
					</button>
				</div>
				<hr />
				<div className="head">Annotations</div>
				<div id="annotations"></div>
			</div>
		</section>
	);
};
