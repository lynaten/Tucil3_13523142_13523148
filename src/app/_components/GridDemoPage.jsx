"use client";
import { useState } from "react";
import { GridStackComponent } from "./Gridstack";
import AlgoPicker from "./AlgoPicker";

export default function GridDemoPage() {
	const [file, setFile] = useState(null);
	const [solver, setSolver] = useState("ucs");

	const [uploadMessage, setUploadMessage] = useState(null);
	const [uploadError, setUploadError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) {
			alert("Please select a file.");
			return;
		}

		setUploadMessage(null);
		setUploadError(null);

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
				setUploadError(err.error || "Failed to process file.");
				// alert(err.error || "Failed to process file.");
				console.error("Server returned error:", err);
				return;
			}

			const data = await res.json();

			console.log("Response returned:", data);
			setUploadMessage("Config file uploaded and processed!");
			// alert("File uploaded and processed!");
		} catch (err) {
			console.error("Network error:", err);
			// alert("Network or unexpected error.");
			setUploadError("Network or unexpected error.");
		}
	};

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		setFile(selectedFile);
		setUploadMessage(null);
		setUploadError(null);
	};

	return (
		<div className="flex gap-4 p-4">
			<div className="flex flex-col">
				<AlgoPicker solver={solver} setSolver={setSolver} />
				<div className=" bg-white shadow-xl rounded-lg p-6 border  w-80 border-gray-300 mt-5 flex-1">
					<h2 className="text-lg font-semibold mb-4 text-gray-800">
						Grid Solver
					</h2>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div className="form-control w-full">
							<label className="label">
								<span className="label-text text-sm font-medium text-gray-700">
									Select Input File
								</span>
							</label>
							<div className="relative ">
								<input
									type="file"
									accept=".txt"
									onChange={handleFileChange}
									className="file-input file-input-bordered file-input-sm w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black hover:bg-gray-100 "
								/>
								{file && (
									<div className="text-xs text-gray-600 mt-1">
										Selected file: {file.name}
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<button
								type="submit"
								disabled={!file}
								className={`rounded-md py-2 px-4 font-medium text-white transition-colors ${
									!file
										? "bg-gray-400 cursor-not-allowed"
										: "bg-black hover:bg-gray-700 active:bg-gray-800"
								}`}
							>
								Upload and Solve
							</button>

							{uploadMessage && (
								<div className="text-sm py-2 px-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
									{uploadMessage}
								</div>
							)}

							{uploadError && (
								<div className="text-sm py-2 px-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
									{uploadError}
								</div>
							)}
						</div>
					</form>

					{/* <div className="mt-4 text-xs text-gray-500">
						Selected Algo:{" "}
						{solver === "ucs"
							? "Uniformed Cost Search (UCS)"
							: solver === "greedy"
							? "Greedy Best First Search (GBFS)"
							: solver === "astar"
							? "A* Search"
							: ""}
					</div> */}
				</div>
			</div>
			<div className="w-fit">
				<GridStackComponent key="grid-2" />
			</div>
		</div>
	);
}
