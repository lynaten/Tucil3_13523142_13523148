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
	//   console.log("== Raw Input Start ==\n" + inputText + "\n== Raw Input End ==");

	const lines = inputText.trimEnd().split(/\r?\n/);
	//   console.log("[DEBUG] Total lines:", lines.length);

	const [rows, cols] = lines[0].trim().split(/\s+/).map(Number);
	//   console.log(cols,rows);
	const numVehicles = Number(lines[1].trim());
	//   console.log(`[DEBUG] Parsed rows: ${rows}, cols: ${cols}, numVehicles: ${numVehicles}`);

	const rawRows = lines.slice(2);
	//   console.log("[DEBUG] Initial rawRows:", rawRows);

	let kPosition = null;

	const replaceK = (r, c) => {
		// console.log(`[DEBUG] Replacing K at rawRows[${r}][${c}]`);
		rawRows[r] = rawRows[r].slice(0, c) + " " + rawRows[r].slice(c + 1);
	};

	if (
		!kPosition &&
		rawRows.length >= rows + 1 &&
		rawRows[rows].includes("K")
	) {
		const c = rawRows[rows].indexOf("K");
		kPosition = { row: rows, col: c };

		// console.log("[DEBUG] Found K on bottom row at column", c);
		rawRows.splice(rows, 1);
	}

	for (let r = 0; !kPosition && r < rows; r++) {
		const line = rawRows[r] ?? "";
		if (line.startsWith("K")) {
			kPosition = { row: r, col: -1 };
			  console.log("[DEBUG] Found K on left edge at row", r);
			replaceK(r, 0);
			break;
		}
		if (line.length > cols && line[cols] === "K") {
			kPosition = { row: r, col: cols };
			  console.log("[DEBUG] Found K on right edge at row", r);
			replaceK(r, cols);
			break;
		}
	}

	if (!kPosition && rawRows.length >= 1 && rawRows[0].includes("K")) {
		const c = rawRows[0].indexOf("K");
		kPosition = { row: -1, col: c };
		// console.log("[DEBUG] Found K on top row at column", c);
		rawRows.shift();
	}

	if (!kPosition) {
		// console.log("[ERROR] No K found in any valid position.");
		throw new Error("Missing exit 'K' in the grid");
	}

	if (kPosition.col === -1) {
		for (let i = 0; i < rows; i++) {
			rawRows[i] = rawRows[i].slice(1);
		}
		// console.log("[DEBUG] Trimmed first column due to left-edge K");
	} else if (kPosition.col === cols) {
		for (let i = 0; i < rows; i++) {
			rawRows[i] = rawRows[i].slice(0, cols);
		}
		// console.log("[DEBUG] Trimmed last column due to right-edge K");
	}

	//   console.log("[DEBUG] Final kPosition:", kPosition);
	//   console.log("[DEBUG] rawRows (post-trim):", rawRows);

	const board = rawRows.map((raw, r) => {
		let line = raw ?? "";
		if (line.length < cols) line = line.padEnd(cols, " ");
		if (line.length !== cols) {
			// console.log(`[ERROR] Row ${r + 1} length mismatch: got ${line.length}, expected ${cols}`);
			throw new Error(`Row ${r + 1} length mismatch`);
		}
		const parsed = Array.from(line, (c) => (c === " " ? "." : c));
		// console.log(`[DEBUG] Parsed board[${r}]:`, parsed.join(''));
		return parsed;
	});

	if (board.length !== rows) {
		// console.log("[ERROR] Row count mismatch. Got:", board.length, "Expected:", rows);
		throw new Error("Row count mismatch");
	}

	//   console.log("[DEBUG] Final board:");
	//   console.log(board.map(r => r.join('')).join('\n'));

	return { rows, cols, numVehicles, board, kPosition };
}

// TESTING
// const parsedInput = readInputBoard(inputText);

// console.log(parsedInput);

// console.log("\nStringified:\n" + boardToString(parsedInput.board));

module.exports = { readInputBoard, boardToString };
