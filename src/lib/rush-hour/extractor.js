// vehicleInfo = {
// 	symbol: String,
// 	position: [number, number][],
//     origin: { row: number, col: number },
//     width: number,
//     height: number,
// 	orientation: "H" | "V",
//     length: number
// 	isPrimary: Boolean,
// };

function extractVehicles(board) {
	const rawMap = getVehiclePositions(board);
	const vehicleMap = buildVehicleInfo(rawMap);
	return vehicleMap;
}

function getVehiclePositions(board) {
	const rawMap = new Map();
	for (let r = 0; r < board.length; r++) {
		for (let c = 0; c < board[0].length; c++) {
			const pointChar = board[r][c];
			if (
				pointChar === "." ||
				pointChar === "K" ||
				pointChar === " " ||
				pointChar === "#"
			) {
				continue;
			}
			if (!rawMap.has(pointChar)) {
				rawMap.set(pointChar, []);
			}
			rawMap.get(pointChar).push([r, c]);
		}
	}
	return rawMap;
}

function buildVehicleInfo(rawMap) {
	const vehicles = new Map();
	let hasPrimary = false;

	for (const [symbol, positions] of rawMap.entries()) {
		const rows = positions.map((p) => p[0]);
		const cols = positions.map((p) => p[1]);

		const minRow = Math.min(...rows),
			maxRow = Math.max(...rows);
		const minCol = Math.min(...cols),
			maxCol = Math.max(...cols);

		const width = maxCol - minCol + 1;
		const height = maxRow - minRow + 1;

		if (width === 1 && height === 1) {
			throw new Error(
				`Vehicle '${symbol}' is only 1x1 — this is not allowed.`
			);
		}

		if (width > 1 && height > 1) {
			throw new Error(
				`Vehicle '${symbol}' is ${width}x${height} — must be strictly horizontal or vertical.`
			);
		}

		const orientation = width > height ? "H" : "V";
		const length = Math.max(width, height);
		const isPrimary = symbol === "P";

		if (isPrimary) {
			hasPrimary = true;
		}

		vehicles.set(symbol, {
			symbol,
			positions,
			origin: { row: minRow, col: minCol },
			width,
			height,
			orientation,
			length,
			isPrimary,
		});
	}

	if (!hasPrimary) {
		throw new Error("Missing primary vehicle 'P' in the grid");
	}

	return vehicles;
}

module.exports = { extractVehicles, buildVehicleInfo, getVehiclePositions };
