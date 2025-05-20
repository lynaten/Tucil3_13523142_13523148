import { Game } from "@/lib/rush-hour/Game";
import { parseGridStackJSON } from "@/lib/rush-hour/fromGridStack";
import { readInputBoard, boardToString } from "@/lib/rush-hour/parser";
import { extractVehicles } from "@/lib/rush-hour/extractor";

const fs = require("fs");

function getBoardOutput(board, kPosition) {
	const rows = board.length;
	const cols = board[0].length;

	const boardToPrint = board.map((row) => [...row]);

	if (kPosition.row === -1 || kPosition.row === rows) {
		const rowIdx = kPosition.row;
		const colIdx = kPosition.col;

		const newBoard = [];

		if (rowIdx === -1) {
			const topRow = Array(cols).fill(" ");
			topRow[colIdx] = "K";
			newBoard.push(topRow);
		}

		for (let r = 0; r < rows; r++) {
			newBoard.push(boardToPrint[r]);
		}

		if (rowIdx === rows) {
			const bottomRow = Array(cols).fill(" ");
			bottomRow[colIdx] = "K";
			newBoard.push(bottomRow);
		}

		return newBoard.map((row) => row.join("")).join("\n");
	}

	if (kPosition.col === -1 || kPosition.col === cols) {
		const newBoard = [];

		for (let r = 0; r < rows; r++) {
			const row = [...boardToPrint[r]];
			if (r === kPosition.row) {
				if (kPosition.col === -1) {
					row.unshift("K");
				} else {
					row.push("K");
				}
			} else {
				if (kPosition.col === -1) {
					row.unshift(" ");
				} else {
					row.push(" ");
				}
			}
			newBoard.push(row);
		}

		return newBoard.map((row) => row.join("")).join("\n");
	}
	return board.map((row) => row.join("")).join("\n");
}

export async function POST(req) {
	const url = new URL(req.url);
	const solverQ = url.searchParams.get("solver");
	const heuristicQ = url.searchParams.get("heuristic") || "distance";
	let gameState;

	if (!solverQ) {
		return new Response(
			JSON.stringify({ error: "Missing solver query parameter" }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}

	try {
		const contentType = req.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			const json = await req.json();
			gameState = parseGridStackJSON(json);
		} else if (contentType.includes("multipart/form-data")) {
			const form = await req.formData();
			const file = form.get("file");
			if (!file || typeof file === "string") {
				throw new Error("Invalid file upload");
			}
			const text = await file.text();
			const parsed = readInputBoard(text);
			const pieceMap = extractVehicles(parsed.board);
			gameState = {
				...parsed,
				pieceMap,
				stringBoard: boardToString(parsed.board),
			};
		} else {
			throw new Error("Unsupported content type");
		}

		const game = new Game(gameState, heuristicQ);
		console.log("Game Initialized:");
		console.log("Rows:", game.rows);
		console.log("Cols:", game.cols);
		console.log("K Position:", game.kPosition);
		console.log("Number of Vehicles:", game.pieceMap.size);
		console.log("Initial Board:\n" + gameState.stringBoard);

		const solvers = {
			ucs: () => game.uniformCostSearch(),
			greedy: () => game.greedyBestFirstSearch(),
			astar: () => game.aStarSearch(),
		};

		const key = solverQ.toLowerCase();
		const fn = solvers[key];

		// console.log(`solving ${key}`);

		if (!fn) {
			return new Response(
				JSON.stringify({ error: `Unknown solver "${solverQ}"` }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// const path = fn() || [];

		let result = fn();
		let path = result.path || [];

		let runtime = result.runtime || 0;
		let nodeCount = result.nodeCount || 0;

		const board = game.board;
		const kPosition = game.kPosition;
		const nodePath = result.nodePath || [];
		const pieceMap = game.pieceMap;
		const heuristic = game.heuristicName;
		const boardWithK = getBoardOutput(board, kPosition);

		console.log("TEST");
		console.log(getBoardOutput(board, kPosition));

		// Per state replay buat save
		const replay = nodePath.map((node, i) => {
			const move = node.move;
			const board = game._rebuildBoard(node.state);
			const boardStr = getBoardOutput(board, kPosition);

			let moveDesc = "Start";
			if (move) {
				const orientation = pieceMap.get(move.piece).orientation;
				const dir = move.dir;
				let dirString;

				if (orientation === "H") {
					dirString = dir === 1 ? "Right (→)" : "Left (←)";
				} else {
					dirString = dir === 1 ? "Down (↓)" : "Up (↑)";
				}

				moveDesc = `${move.piece} moves ${dirString}`;
			}
			return {
				step: i,
				move,
				moveDesc,
				board: boardStr,
			};
		});

		// const outputJSON = {
		// 	solver: solverQ,
		// 	path,
		// 	replay,
		// 	runtime,
		// 	nodeCount,
		// };

		const textLog = replay
			.map(({ step, moveDesc, board }) => {
				return `Step ${step + 1}: ${moveDesc}\n${board}`;
			})
			.join("\n\n");

		fs.writeFileSync("test/output.txt", textLog, "utf-8");
		console.log("Saved !!!");

		const pieceMapObj = Object.fromEntries(pieceMap);
		// console.log(runtime);
		// console.log(nodeCount);
		// console.log(pieceMapObj);

		//TEST
		console.table(path);

		return new Response(
			JSON.stringify({
				path,
				board,
				pieceMap: pieceMapObj,
				kPosition,
				rows: game.rows,
				cols: game.cols,
				runtime,
				nodeCount,
				heuristic,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (e) {
		return new Response(JSON.stringify({ error: e.message }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
}
