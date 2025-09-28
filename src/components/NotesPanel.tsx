import { useState } from "react";

export const NotesPanel = () => {
	const [notes, setNotes] = useState<string>("");
	return (
		<section className="panel w-[400px]">
			<div className="head">Notes</div>
			<div className="body">
				<textarea
					className="w-full"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Write your notes here..."
				/>
			</div>
		</section>
	);
};
