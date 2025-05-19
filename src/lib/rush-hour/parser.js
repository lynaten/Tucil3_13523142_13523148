const fs = require("fs");

// ! FOR TESTING
// input path file
// const inputPath = process.argv[2];
// if (!inputPath) {
// 	console.error("File input invalid!");
// 	process.exit(1);
// }

// const inputText = fs.readFileSync(inputPath, "utf-8");

function boardToString(board) {
	return board.map((row) => row.join("")).join("\n");
}

function readInputBoard(inputText) {
	const lines = inputText.trim().split(/\r?\n/);
	const [rows, cols] = lines[0].split(" ").map(Number);
	let numVehicles = Number(lines[1]);
	const rawRows = lines.slice(2);

	let kPosition = null;

	if (rawRows.length === rows + 1 && rawRows[0].includes("K")) {
		const kCol = rawRows[0].indexOf("K");
		kPosition = { row: -1, col: kCol };
		rawRows.shift();
	} else if (rawRows.length === rows + 1 && rawRows[rows].includes("K")) {
		const kCol = rawRows[rows].indexOf("K");
		kPosition = { row: rows, col: kCol };
		rawRows.pop();
	}

	for (let r = 0; r < rows && !kPosition; ++r) {
		let line = (rawRows[r] || "").trimStart();
		rawRows[r] = line;

		if (line.length === cols + 1 && line[0] === "K") {
			kPosition = { row: r, col: -1 };
			rawRows[r] = line.slice(1);
			break;
		}
		if (line.length === cols + 1 && line[cols] === "K") {
			kPosition = { row: r, col: cols };
			rawRows[r] = line.slice(0, cols);
			break;
		}
	}

	// ============== VALIDATIONS ================
	if (!kPosition) {
		throw new Error("Missing exit 'K' in the grid");
	}

	const { row: kRow, col: kCol } = kPosition;
	if (!(kRow === -1 || kRow === rows || kCol === -1 || kCol === cols)) {
		throw new Error("Invalid exit 'K' position, have to be on the edge");
	}

	if (
		(kRow === -1 && kCol === -1) ||
		(kRow === rows && kCol === cols) ||
		(kRow === -1 && kCol === cols) ||
		(kRow === rows && kCol === -1)
	) {
		throw new Error(
			"Invalid exit 'K' position, have to be on the edge, but not on the corner"
		);
	}

	const board = rawRows.slice(0, rows).map((line) => {
		if (line.length !== cols) {
			throw new Error("Column count mismatch");
		}

		return Array.from(line, (c) => (c === " " ? "." : c));
	});

	if (board.length !== rows) {
		throw new Error(
			"Invalid board size (rows), expected rows: " +
				rows +
				" got: " +
				board.length
		);
	}

	if (rawRows.length < rows) {
		throw new Error("Not enough rows");
	}

	for (let i = 0; i < board.length; i++) {
		if (board[i].length !== cols) {
			throw new Error(
				"Invalid board size (columns), expected column: " +
					cols +
					" got: " +
					board[i].length
			);
		}
	}

	return {
		rows,
		cols,
		numVehicles,
		board,
		kPosition,
	};
}

// TESTING
// const parsedInput = readInputBoard(inputText);

// console.log(parsedInput);

// console.log("\nStringified:\n" + boardToString(parsedInput.board));

module.exports = { readInputBoard, boardToString };
