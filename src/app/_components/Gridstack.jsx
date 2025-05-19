"use client";

import { useEffect, useState, useMemo } from "react";
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
	setNodeCount,
	setRuntime,
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
			console.log("Received data from backend:", data);
			// console.log(data.runtime);
			// console.log(data.nodeCount);

			if (data.path) {
				setSolutionPath(data.path);
			}

			if (data.pieceMap) {
				setPieceMap(data.pieceMap);
			}

			if (data.board) {
				setServerBoard(data.board);
			}

			if (data.runtime !== undefined) {
				setRuntime(data.runtime);
			}

			if (data.nodeCount !== undefined) {
				setNodeCount(data.nodeCount);
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
		};
		if (gridStack?.willItFit(widget)) {
			addWidget(() => widget);
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

export function AddRow({ heightUnits, setHeightUnits }) {
	const { resizeWidget, removeAllWidgetsExceptMainSubGrid } =
		useGridStackContext();

	const handleAddRow = () => {
		const el = document.querySelector('[gs-id="main-sub-grid"]');
		if (!el?.gridstackNode) {
			console.warn("main-sub-grid tidak ditemukan atau belum siap");
			return;
		}
		removeAllWidgetsExceptMainSubGrid();

		const { h } = el.gridstackNode;
		resizeWidget("main-sub-grid", { h: h + 1 });

		setHeightUnits(heightUnits + 1);
	};

	return (
		<button
			onClick={handleAddRow}
			className="bg-sky-100 flex-1 text-sky-800 hover:bg-sky-200 px-4 py-3 flex items-center"
		>
			<Plus className="h-4 w-4 mr-2" />
			Add Row
		</button>
	);
}

export function RemoveRow({ heightUnits, setHeightUnits }) {
	const { resizeWidget, removeAllWidgetsExceptMainSubGrid } =
		useGridStackContext();

	const handleRemoveRow = () => {
		const el = document.querySelector('[gs-id="main-sub-grid"]');
		if (!el?.gridstackNode) {
			console.warn("main-sub-grid tidak ditemukan atau belum siap");
			return;
		}

		const { h } = el.gridstackNode;

		if (h <= 1) {
			alert("Sub-grid must have at least 1 row.");
			return;
		}
		removeAllWidgetsExceptMainSubGrid();

		resizeWidget("main-sub-grid", { h: h - 1 });
		setHeightUnits(heightUnits - 1);
	};

	return (
		<button
			onClick={handleRemoveRow}
			className="bg-sky-100 text-sky-800 hover:bg-sky-200 px-4 py-3 flex items-center"
		>
			<Trash2 className="h-4 w-4 mr-2" />
			Remove Row
		</button>
	);
}

export function RemoveCol({ widthUnits, setWidthUnits }) {
	const { removeAllWidgetsExceptMainSubGrid } = useGridStackContext();
	const handleRemoveCol = () => {
		removeAllWidgetsExceptMainSubGrid();
		setWidthUnits(Math.max(widthUnits - 1, 4));
	};

	return (
		<button
			onClick={handleRemoveCol}
			className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-3 flex items-center"
		>
			<Trash2 className="w-4 h-4 mr-1" />
			Remove Col
		</button>
	);
}

export function AddCol({ widthUnits, setWidthUnits }) {
	const { removeAllWidgetsExceptMainSubGrid } = useGridStackContext();
	const handleAddCol = () => {
		removeAllWidgetsExceptMainSubGrid();
		setWidthUnits(widthUnits + 1);
	};

	return (
		<button
			onClick={handleAddCol}
			className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-3 flex-1 flex items-center"
		>
			<Plus className="w-4 h-4 mr-1" />
			Add Col
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
			const meta = pieceMap[move.piece];

			const count = move.count ?? 1;

			if (!meta) return;

			if (meta.orientation === "H") {
				moveWidget(move.piece, move.dir * count, 0);
			} else {
				moveWidget(move.piece, 0, move.dir * count);
			}
			step++;
		}, 100);
		return () => clearInterval(interval);
	}, [solutionPath, pieceMap]);

	return null;
}

export function CellSizeInput({ cellHeight, setCellHeight }) {
	const { setCellSize } = useGridStackContext();

	const handleChange = (e) => {
		const newSize = parseInt(e.target.value, 10);
		if (isNaN(newSize) || newSize < 20) return;
		setCellHeight(newSize);
		setCellSize(newSize);
	};

	return (
		<label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
			Cell Size:
			<input
				type="number"
				min="30"
				value={cellHeight}
				onChange={handleChange}
				className="border border-gray-300 rounded px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			/>
			<span className="text-gray-400 text-xs">px</span>
		</label>
	);
}

export function GridStackComponent({
	runtime,
	nodeCount,
	setRuntime,
	setNodeCount,
	parsedGame,
}) {
	const [copiedOptions, setCopiedOptions] = useState("");
	const [widthUnits, setWidthUnits] = useState(parsedGame?.cols + 2 || 8);
	const [heightUnits, setHeightUnits] = useState(parsedGame?.rows + 2 || 8);
	const [cellHeight, setCellHeight] = useState(60);
	const [solutionPath, setSolutionPath] = useState(null);
	const [pieceMap, setPieceMap] = useState({});
	const [serverBoard, setServerBoard] = useState(null);

	const BASE_GRID_OPTIONS = {
		locked: true,
		acceptWidgets: ".grid-stack-item[data-gs-group='main']",
		columnOpts: {
			columnWidth: 60,
			columnMax: 100,
			layout: "moveScale",
			breakpointForWindow: false,
		},
		float: true,
		itemClass: "grid-stack-item",
		margin: 0,
		cellHeight: 60,
		removable: ".trash",
		children: [
			{
				id: "main-sub-grid",
				x: 1,
				y: 1,
				w: 6,
				h: 6,
				noMove: true,
				locked: true,
				noResize: true,
				subGridOpts: {
					column: "auto",
					margin: 5,
					cellHeight: 60,
					itemClass: "grid-stack-item",
					removable: ".trash",
					layout: "list",
				},
			},
		],
	};

	return (
		<GridStackProvider initialOptions={BASE_GRID_OPTIONS}>
			<div className="flex gap-6 px-4 py-8 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 shadow-xl border border-gray-300">
				<div className="w-80 shrink-0 mr-4">
					<div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 sticky z-0">
						<div className="mb-4 z-0">
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
							<div className="flex gap-2">
								<AddRow
									heightUnits={heightUnits}
									setHeightUnits={setHeightUnits}
								/>
								<RemoveRow
									heightUnits={heightUnits}
									setHeightUnits={setHeightUnits}
								/>
							</div>
							<div className="flex gap-2 w-full justify-between">
								<AddCol
									widthUnits={widthUnits}
									setWidthUnits={setWidthUnits}
								/>
								<RemoveCol
									widthUnits={widthUnits}
									setWidthUnits={setWidthUnits}
								/>
							</div>

							<div className="border-t border-gray-200"></div>

							<div className="flex gap-3">
								<SaveButton
									setCopiedOptions={setCopiedOptions}
									setSolutionPath={setSolutionPath}
									setPieceMap={setPieceMap}
									setServerBoard={setServerBoard}
									setRuntime={setRuntime}
									setNodeCount={setNodeCount}
								/>
							</div>
						</div>
					</div>
					<button className="trash flex-1 mt-8 px-25 py-16 bg-red-500/60 animate-pulse text-white rounded-md text-xl transition-colors flex items-center justify-center shadow-sm">
						<Trash2 size={24} className="mr-1" />
						Drag Here
					</button>
				</div>

				<div className="flex-1 flex flex-col">
					<div className="border bg-white rounded-lg shadow-md p-6 my-4 ml-4">
						<div>
							<h2 className="text-lg font-bold text-gray-800">
								Rush Hour Solver 🚗
								<p className="text-md text-gray-600">
									Puzzle Board ({widthUnits - 2} ×{" "}
									{heightUnits - 2})
								</p>
							</h2>
							<CellSizeInput
								cellHeight={cellHeight}
								setCellHeight={setCellHeight}
							/>
						</div>

						<div className="rounded-lg p-4 overflow-auto">
							<div
								style={{
									width: `${widthUnits * cellHeight}px`,
								}}
								className="max-w-full overflow-x-auto"
							>
								<GridstackInner
									parsedGame={parsedGame}
									setWidthUnits={setWidthUnits}
									setHeightUnits={setHeightUnits}
								/>
							</div>
						</div>
						<div className="bg-white w-full rounded-lg ml-4 flex-col flex">
							<span>Runtime: {runtime}</span>
							<span>Nodes Visited: {nodeCount}</span>
						</div>
					</div>
				</div>

				<GridStackAnimate
					solutionPath={solutionPath}
					pieceMap={pieceMap}
				/>
			</div>
		</GridStackProvider>
	);
}
