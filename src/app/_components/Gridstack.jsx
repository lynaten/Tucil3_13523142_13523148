"use client";

import { useEffect, useState } from "react";
import { GridStackProvider } from "@/lib/grid-stack/grid-stack-provider";
import { useGridStackContext } from "@/lib/grid-stack/grid-stack-context";
import AlgoPicker from "@/app/_components/AlgoPicker";

import "gridstack/dist/gridstack.css";
import "../../styles/gridstackreact.css";
import GridstackInner from "./Gridstackinner";
import { Plus, Save, Trash2 } from "lucide-react";
const COLORS = [
	"bg-pink-200",
	"bg-rose-200",
	"bg-orange-200",
	"bg-indigo-200",
	"bg-emerald-200",
	"bg-yellow-200",
	"bg-blue-200",
	"bg-purple-200",
	"bg-green-200",
	"bg-fuchsia-200",
	"bg-purple-200",
	"bg-yellow-200",
	"bg-emerald-200",
	"bg-indigo-200",
	"bg-pink-200",
	"bg-teal-200",
	"bg-teal-200",
	"bg-fuchsia-200",
	"bg-purple-200",
	"bg-blue-200",
	"bg-orange-200",
	"bg-pink-200",
	"bg-cyan-200",
];

const LETTER_IDS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").filter(
	(c) => c !== "K" && c !== "P"
);

export function SaveButton({
	setCopiedOptions,
	setSolutionPath,
	setPieceMap,
	setServerBoard,
}) {
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
			// console.log(data.board);

			// console.log("pieceMap keys:", Object.keys(data.pieceMap));
			// console.log("P meta:", data.pieceMap["P"]);
			if (data.path) {
				setSolutionPath(data.path);
			}

			if (data.pieceMap) {
				setPieceMap(data.pieceMap);
			}

			if (data.board) {
				setServerBoard(data.board);
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
			className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm"
		>
			<Save size={28} className="mr-1" />
			Save & Solve
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
		const color = "bg-green-500";
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
			className="bg-green-100 text-green-800 rounded hover:bg-green-200 px-4 py-3  flex items-center"
		>
			<Plus className="h-4 w-4 mr-2 " />
			Add Exit
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
			className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-4 py-3 flex items-center"
		>
			<Plus className="h-4 w-4 mr-2" />
			Add Obstacle
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
			className="bg-blue-600 px-4 py-3 text-white"
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
		const color = "bg-red-500";
		const text = id;
		const textColor = "text-white";

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
			className="bg-red-100 text-red-800  hover:bg-red-200 px-4 py-3  flex items-center"
		>
			<Plus className="h-4 w-4 mr-2" />
			Add Primary Vehicle
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
		}, 100);
		return () => clearInterval(interval);
	}, [solutionPath, pieceMap]);

	return null;
}

export function GridStackComponent() {
	const [copiedOptions, setCopiedOptions] = useState("");
	const [widthUnits, setWidthUnits] = useState(8);
	const [heightUnits, setHeightUnits] = useState(8);
	const cellHeight = 60;
	const [solutionPath, setSolutionPath] = useState(null);
	const [pieceMap, setPieceMap] = useState({});
	const [serverBoard, setServerBoard] = useState(null);

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
				x: 1,
				y: 1,
				w: 6,
				h: heightUnits - 2,
				locked: true,
				subGridOpts: {
					acceptWidgets: ".grid-stack-item[data-gs-group='sub']",
					// float: true,
					margin: 5,
					cellHeight: cellHeight,
					itemClass: "grid-stack-item",
					removable: ".trash",
					layout: "list",
					minRow: 6,
				},
			},
		],
	};

	return (
		<GridStackProvider initialOptions={BASE_GRID_OPTIONS}>
			<div className="flex gap-6 px-4 py-8 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 shadow-xl border border-gray-300">
				<div className="flex-1 flex flex-col">
					<div className="border bg-white rounded-lg shadow-md p-6 my-4 ml-4">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-bold text-gray-800">
								Puzzle Board
							</h2>
							<div className="flex items-center">
								<label className="flex items-center text-sm text-gray-600 font-medium">
									Grid columns:
									<input
										type="number"
										min="1"
										value={widthUnits - 2}
										onChange={(e) =>
											setWidthUnits(
												parseInt(e.target.value, 10) +
													2 || 1
											)
										}
										className="border border-gray-300 rounded px-3 py-1 w-20 ml-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
									/>
								</label>
							</div>
						</div>

						<div className=" rounded-lg p-4 overflow-auto">
							<div
								style={{
									width: `${widthUnits * cellHeight}px`,
								}}
								className="max-w-full overflow-x-auto"
							>
								<GridstackInner />
							</div>
						</div>
					</div>
					{/* 
					{copiedOptions && (
						<div className="bg-white rounded-lg shadow-md p-4">
							<h3 className="text-md font-semibold text-gray-700 mb-2">
								Saved Grid (JSON)
							</h3>
							<div className="bg-gray-50 p-3 border border-gray-200 rounded-md">
								<pre className="text-sm whitespace-pre-wrap break-all text-gray-700">
									{JSON.stringify(copiedOptions, null, 2)}
								</pre>
							</div>
						</div>
					)} */}
				</div>

				<div className="w-80 shrink-0 mr-4">
					<div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 sticky z-0">
						<div className=" mb-4 z-0">
							<h2 className="text-lg font-bold text-gray-800">
								Tools
							</h2>
							<p className="text-sm text-gray-500">
								Add, remove, and manipulate vehicles on the
								board
							</p>
						</div>

						<div className="flex flex-col gap-3">
							<AddPrimaryVehicle />
							<AddObstacle />
							<AddExit />

							<div className="border-t border-gray-200"></div>

							<div className="flex gap-3">
								<SaveButton
									setCopiedOptions={setCopiedOptions}
									setSolutionPath={setSolutionPath}
									setPieceMap={setPieceMap}
									setServerBoard={setServerBoard}
								/>
							</div>
						</div>
					</div>
					<button className="trash flex-1 mt-8 px-25 py-16 bg-red-500/60 animate-pulse text-white rounded-md text-xl  transition-colors flex items-center justify-center shadow-sm">
						<Trash2 size={24} className="mr-1" />
						Drag Here
					</button>
				</div>

				<GridStackAnimate
					solutionPath={solutionPath}
					pieceMap={pieceMap}
				/>
			</div>
		</GridStackProvider>
	);
}
