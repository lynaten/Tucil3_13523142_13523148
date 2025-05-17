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
	const lines = inputText.split("\n").map((l) => l.replace(/\r/g, ""));

	let [rows, colsConfig] = lines[0].split(" ").map(Number);
	let cols = Math.max(...lines.slice(2).map((line) => line.length));

	const numPieces = Number(lines[1]);
	const boardAll = lines.slice(2);

	let kPosition = null;
	let boardMain = [];

	// extrakrowidx -> -1 kalo K kiri/kanan
	let extraKRowIdx = boardAll.findIndex((line) => {
		const trimmed = line.replace(/ /g, "");
		return trimmed.length === 1 && trimmed[0] === "K";
	});
	// console.log("extraKRowIdx", extraKRowIdx);

	if (extraKRowIdx !== -1) {
		// K top/down
		const kCol = boardAll[extraKRowIdx].indexOf("K");
		const arr = Array(cols).fill("#");

		arr[kCol] = "K";

		kPosition = { row: extraKRowIdx, col: kCol };

		// blank -> titik (.)
		boardMain = boardAll.map((line, rowIdx) => {
			if (rowIdx === extraKRowIdx) return arr;
			return line.split("").map((c) => (c === " " ? "." : c));
		});
	} else {
		// K left/right
		const tempBoard = boardAll.map((line) => line.split(""));

		for (let c = 0; c < cols; c++) {
			let kRow = -1;
			let onlyK = true;
			for (let r = 0; r < tempBoard.length; r++) {
				// console.log(r, c);
				const cell = tempBoard[r][c];
				if (cell === "K") {
					if (kRow === -1) {
						kRow = r;
					} else onlyK = false;
				} else if (cell !== " " && cell !== undefined) {
					onlyK = false;
				}
			}
			// console.log("kRow: ", kRow, "onlyK: ", onlyK);

			// padding # on onlyK
			// console.log("TEST");
			// console.log(kRow);

			if (onlyK && kRow !== -1) {
				// console.log("TEST2");

				boardMain = tempBoard.map((row, r) => {
					const arr = row.map((c) => (c === " " ? "." : c));
					if (r !== kRow) arr[c] = "#";
					// console.log("C ", c);

					return arr;
				});
				kPosition = { row: kRow, col: c };
				break;
			}
		}

		if (!boardMain.length) {
			boardMain = boardAll.map((line, rowIdx) => {
				const arr = line.split("").map((c) => (c === " " ? "." : c));
				const colIdx = arr.indexOf("K");
				if (colIdx !== -1) {
					kPosition = { row: rowIdx, col: colIdx };
				}
				return arr;
			});
		}
	}

	return {
		rows,
		cols: colsConfig,
		numPieces,
		board: boardMain,
		kPosition,
	};
}

// TESTING
// const parsedInput = readInputBoard(inputText);

// console.log(parsedInput);

// console.log("\nStringified:\n" + boardToString(parsedInput.board));

module.exports = { readInputBoard, boardToString };
