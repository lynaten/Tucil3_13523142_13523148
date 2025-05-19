"use client";
import { useState } from "react";
import { GridStackComponent } from "./Gridstack";
import AlgoPicker from "./AlgoPicker";

const notes = {
	title: "Notes:",
	content: [
		{
			text: "Untuk input secara graphical, bisa drag dan resize grid maupun piece secara flexible, namun setiap kali resize dia bakal reset piece nya, jadi set board dengan resize sebelum menaruh vehicle",
		},
		{
			text: "Untuk ubah row, bisa dilakukan dengan meresize grid kebawah",
		},
		{
			text: "Add obstacle/vehicle akan menambah kebawah dan jika mentok ke row terakhir, perlu dipindahkan terlebih dahulu sebelum add lagi atau tidak akan keregister piece nya",
		},
	],
};

export default function GridDemoPage() {
	const [file, setFile] = useState(null);
	const [solver, setSolver] = useState("ucs");

	const [uploadMessage, setUploadMessage] = useState(null);
	const [uploadError, setUploadError] = useState(null);
	const [parsedGame, setParsedGame] = useState(null);

	const [runtime, setRuntime] = useState(0);
	const [nodeCount, setNodeCount] = useState(0);

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

		try {
			const res = await fetch(`/api/parse`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const err = await res.json();
				setUploadError(err.error || "Failed to process file.");
				console.error("Server returned error:", err);
				return;
			}

			const data = await res.json();

			setRuntime(data.runtime ?? 0);
			setNodeCount(data.nodeCount ?? 0);

			setParsedGame(data);
			console.log("Response returned:", data);
			setUploadMessage("Config file formatted to gridstack!");
		} catch (err) {
			console.error("Network error:", err);
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
			<div className="flex flex-col justify-start">
				<AlgoPicker solver={solver} setSolver={setSolver} />
				<div className=" bg-white shadow-xl rounded-lg p-6 border w-80 border-gray-300 mt-5">
					<h2 className="text-lg font-semibold mb-4 text-gray-800">
						Upload File
					</h2>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div className="form-control w-full">
							<label className="label">
								<span className="label-text text-sm font-medium text-gray-700">
									Select Input File (.txt)
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
								Upload
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
				</div>
				<br></br>
				<div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sticky top-6 w-80">
					<div className="flex items-center mb-3">
						<h3 className="text-md font-semibold text-gray-800">
							{notes.title}
						</h3>
					</div>

					<div className="space-y-3">
						{notes.content.map((item, index) => (
							<div
								key={index}
								className="border-l-3 border-black/80 pl-3"
							>
								<p className="text-xs text-gray-600 leading-relaxed">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="w-fit">
				<GridStackComponent
					key="grid-2"
					runtime={runtime}
					nodeCount={nodeCount}
					setRuntime={setRuntime}
					setNodeCount={setNodeCount}
					parsedGame={parsedGame}
				/>
			</div>
		</div>
	);
}
