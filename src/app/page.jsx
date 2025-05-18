"use client";
import { useState } from "react";
import { GridStackComponent } from "./_components/Gridstack";
import AlgoPicker from "./_components/AlgoPicker";

export default function GridDemoPage() {
	const [file, setFile] = useState(null);
	const [solver, setSolver] = useState("ucs");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) {
			alert("Please select a file.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		// const solver = "astar";  atau "ucs", "greedy"

		try {
			const res = await fetch(`/api/solve?solver=${solver}`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const err = await res.json();
				alert(err.error || "Failed to process file.");
				console.error("Server returned error:", err);
				return;
			}

			const data = await res.json();

			console.log("Response returned:", data);
			alert("File uploaded and processed!");
		} catch (err) {
			console.error("Network error:", err);
			alert("Network or unexpected error.");
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4">
			<AlgoPicker solver={solver} setSolver={setSolver} />
			<form
				onSubmit={handleSubmit}
				className="flex flex-col items-center gap-2"
			>
				<input
					type="file"
					accept=".txt"
					onChange={(e) => setFile(e.target.files[0])}
					className="file-input file-input-bordered file-input-sm"
				/>
				<button
					type="submit"
					className="bg-blue-600 px-4 py-1 text-white rounded-md"
				>
					Upload and Solve
				</button>
			</form>

			<div className="w-fit bg-cover bg-center">
				<GridStackComponent key="grid-2" />
			</div>
		</div>
	);
}
