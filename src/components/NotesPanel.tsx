import { useState } from "react";

export const NotesPanel = () => {
	const [notes, setNotes] = useState<string>("");
	return (
		<section className="panel">
			<div className="head">Notes</div>
			<div className="body">
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Write your notes here..."
				/>
			</div>
		</section>
	);
};
