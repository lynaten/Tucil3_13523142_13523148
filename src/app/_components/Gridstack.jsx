"use client";

import { useEffect, useState } from "react";
import { GridStackProvider } from "@/lib/grid-stack/grid-stack-provider";
import { useGridStackContext } from "@/lib/grid-stack/grid-stack-context";
import AlgoPicker from "@/app/_components/AlgoPicker";

import "gridstack/dist/gridstack.css";
import "../../styles/gridstackreact.css";
import GridstackInner from "./Gridstackinner";

const COLORS = [
	"bg-pink-500",
	"bg-rose-400",
	"bg-orange-600",
	"bg-indigo-600",
	"bg-emerald-500",
	"bg-yellow-600",
	"bg-red-700",
	"bg-blue-400",
	"bg-purple-400",
	"bg-green-400",
	"bg-fuchsia-400",
	"bg-purple-600",
	"bg-yellow-400",
	"bg-emerald-600",
	"bg-indigo-400",
	"bg-pink-400",
	"bg-red-600",
	"bg-teal-500",
	"bg-teal-400",
	"bg-green-600",
	"bg-fuchsia-500",
	"bg-purple-500",
	"bg-blue-600",
	"bg-orange-500",
	"bg-pink-600",
	"bg-red-500",
];

const LETTER_IDS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").filter(
	(c) => c !== "K" && c !== "P"
);

export function SaveButton({ setCopiedOptions, setSolutionPath, setPieceMap }) {
	const { saveOptions } = useGridStackContext();
	const [solver, setSolver] = useState("ucs");

	const handleSave = async () => {
		const saved = saveOptions?.();

		if (!saved || typeof saved !== "object" || !("children" in saved)) {
			console.warn("Failed to save grid state:", saved);
			return;
		}

		setCopiedOptions?.(structuredClone(saved));
		console.log("Saved Grid:", saved);

		try {
			const res = await fetch(`/api/solve?solver=${solver}`, {
				method: "POST",
				body: JSON.stringify(saved),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) {
				const err = await res.json();
				alert(err.error || "Failed to process grid.");
				console.error("Server returned error:", err);
				return;
			}

			const data = await res.json();
			console.log("Response returned:", data);

			// console.log("pieceMap keys:", Object.keys(data.pieceMap));
			// console.log("P meta:", data.pieceMap["P"]);

			if (data.path) {
				setSolutionPath(data.path);
			}

			if (data.pieceMap) {
				setPieceMap(data.pieceMap);
			}

			alert("Grid state sent to server successfully.");
		} catch (err) {
			console.error("Network error:", err);
			alert("Network or unexpected error.");
		}
	};

	return (
		<button
			onClick={handleSave}
			className="bg-green-600 px-4 py-2 text-white"
		>
			💾 Save & Solve
		</button>
	);
}

export function AddExit() {
	const { addWidget, gridStack, _rawWidgetMetaMap } = useGridStackContext();

	const handleAdd = () => {
		const id = "K";

		if (_rawWidgetMetaMap.value.has(id)) {
			alert("Exit (K) has already been added.");
			return;
		}

		const color = "bg-black";
		const text = id;

		const widget = {
			id,
			x: 0,
			y: 0,
			w: 1,
			h: 1,
			locked: true,
			noResize: true,
			group: "main",
			content: JSON.stringify({
				name: "Block",
				props: { color, text },
			}),
			// sizeToContent: 3,
		};

		if (gridStack?.willItFit(widget)) {
			addWidget(() => widget);
		} else {
			// alert("Main Grid is full.");
		}
	};

	return (
		<button
			onClick={handleAdd}
			className="bg-blue-600 px-4 py-2 text-white"
		>
			➕ Add Exit
		</button>
	);
}

export function AddObstacle() {
	const { addWidget } = useGridStackContext();
	const [index, setIndex] = useState(0);

	const handleAdd = () => {
		const current = index % LETTER_IDS.length;
		const id = LETTER_IDS[current];
		const color = COLORS[current % COLORS.length];
		const text = id;

		const widget = {
			id,
			x: 0,
			y: 0,
			w: 1,
			h: 1,
			locked: true,
			group: "sub",
			content: JSON.stringify({
				name: "Block",
				props: { color, text },
			}),
		};

		addWidget(() => widget, "main-sub-grid");
		// cycle back to 0 after reaching the end
		setIndex((prev) => (prev + 1) % LETTER_IDS.length);
	};

	return (
		<button
			onClick={handleAdd}
			className="bg-purple-600 px-4 py-2 text-white"
		>
			➕ Add Obstacle
		</button>
	);
}

export function MovePrimaryVehicle() {
	const { moveWidget } = useGridStackContext();

	const handleMoveRight = () => {
		moveWidget("P", 0, -1);
	};

	return (
		<button
			onClick={handleMoveRight}
			className="bg-blue-600 px-4 py-2 text-white"
		>
			Move P →
		</button>
	);
}

export function AddPrimaryVehicle() {
	const { addWidget, _rawWidgetMetaMap } = useGridStackContext();

	const handleAdd = () => {
		if (_rawWidgetMetaMap.value.has("P")) {
			alert("Primary vehicle (P) has already been added.");
			return;
		}

		const id = "P";
		const color = "bg-white";
		const text = id;
		const textColor = "text-black";

		const widget = {
			id,
			x: 0,
			y: 0,
			w: 1,
			h: 1,
			locked: true,
			group: "sub",
			content: JSON.stringify({
				name: "Block",
				props: { color, text, textColor },
			}),
		};

		addWidget(() => widget, "main-sub-grid");
	};

	return (
		<button
			onClick={handleAdd}
			className="bg-yellow-600 px-4 py-2 text-white"
		>
			➕ Add Primary Vehicle
		</button>
	);
}

function GridStackAnimate({ solutionPath, pieceMap }) {
	const { moveWidget } = useGridStackContext();
	useEffect(() => {
		if (!solutionPath || solutionPath.length === 0) return;

		let step = 0;

		const interval = setInterval(() => {
			if (step >= solutionPath.length) {
				clearInterval(interval);
				return;
			}

			const move = solutionPath[step];
			const meta = pieceMap[move.piece]; // piece

			// console.log("move.piece", move.piece);
			// console.log("pieceMap:", pieceMap);
			// console.log(meta.orientation);

			if (!meta) return;

			if (meta.orientation === "H") {
				moveWidget(move.piece, move.dir, 0);
			} else {
				moveWidget(move.piece, 0, move.dir);
			}
			step++;
		}, 50);
		return () => clearInterval(interval);
	}, [solutionPath, pieceMap]);

	return null;
}

export function GridStackComponent() {
	const [copiedOptions, setCopiedOptions] = useState("");
	const [widthUnits, setWidthUnits] = useState(6);
	// const [heightUnits, setHeightUnits] = useState(6);
	const cellHeight = 60;
	const [solutionPath, setSolutionPath] = useState(null);
	const [pieceMap, setPieceMap] = useState({});

	const BASE_GRID_OPTIONS = {
		locked: true,
		acceptWidgets: ".grid-stack-item[data-gs-group='main']",
		columnOpts: {
			columnWidth: cellHeight,
			columnMax: 100,
			layout: "moveScale",
			breakpointForWindow: false,
		},
		float: true,
		itemClass: "grid-stack-item",
		margin: 5,
		cellHeight: cellHeight,
		removable: ".trash",

		children: [
			{
				id: "main-sub-grid",
				x: 0,
				y: 0,
				w: 6,
				h: 6,
				locked: true,
				subGridOpts: {
					acceptWidgets: ".grid-stack-item[data-gs-group='sub']",
					float: true,
					margin: 5,
					cellHeight: cellHeight,
					itemClass: "grid-stack-item",
					removable: ".trash",
					layout: "list",
					minRow: 1,
				},
			},
		],
	};

	return (
		<GridStackProvider initialOptions={BASE_GRID_OPTIONS}>
			<div className="w-fit flex flex-col justify-center items-center">
				<div className="flex flex-col gap-2 items-start mb-2">
					<label className="text-sm">
						Grid columns:
						<input
							type="number"
							min="1"
							value={widthUnits}
							onChange={(e) =>
								setWidthUnits(parseInt(e.target.value, 10) || 1)
							}
							className="border border-gray-300 rounded px-2 py-1 w-20 ml-2"
						/>
					</label>
				</div>
				{/* 
				<div className="flex flex-col gap-2 items-start mb-2">
					<label className="text-sm">
						Grid rows:
						<input
							type="number"
							min="1"
							value={heightUnits}
							onChange={(e) =>
								setHeightUnits(
									parseInt(e.target.value, 10) || 1
								)
							}
							className="border border-gray-300 rounded px-2 py-1 w-20 ml-2"
						/>
					</label>
				</div> */}

				<div className="flex h-fit">
					<AddExit />
					<AddObstacle />
					<AddPrimaryVehicle />
					<MovePrimaryVehicle />
					<SaveButton
						setCopiedOptions={setCopiedOptions}
						setSolutionPath={setSolutionPath}
						setPieceMap={setPieceMap}
					/>

					<div className="trash w-10 h-10 bg-red-300 flex justify-center items-center">
						🗑️
					</div>
				</div>
				<div
					style={{ width: `${widthUnits * cellHeight}px` }}
					className="max-w-screen overflow-x-auto mb-16"
				>
					<GridstackInner />
				</div>

				{copiedOptions && (
					<div
						style={{ width: `${widthUnits * cellHeight}px` }}
						className="max-w-screen mt-4 p-2 bg-gray-100 text-sm whitespace-pre-wrap break-all border border-gray-300 rounded"
					>
						<strong>Saved Grid (JSON):</strong>
						<pre className=" whitespace-pre-wrap break-all">
							{JSON.stringify(copiedOptions, null, 2)}
						</pre>
					</div>
				)}
			</div>
			<GridStackAnimate solutionPath={solutionPath} pieceMap={pieceMap} />
		</GridStackProvider>
	);
}
