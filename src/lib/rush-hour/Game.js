const { Node } = require("./node");

class Game {
	constructor(gameState, heuristic = "distance") {
		this.rows = gameState.rows;
		this.cols = gameState.cols;
		this.kPosition = gameState.kPosition;
		this.pieceMap = gameState.pieceMap;
		this.board = gameState.board;

		this.heuristicName = heuristic;

		this.heuristicFn =
			{
				distance: this._heuristicDistance,
				blocker: this._heuristicBlocker,
				composite: this._heuristicComposite,
			}[heuristic] || this._heuristicDistance;
	}

	getInitialNode() {
		const initialState = new Map(
			[...this.pieceMap.entries()].map(([s, v]) => [s, v.origin])
		);
		return new Node(initialState);
	}
}

// * ======================= HELPER ======================= * //
Game.prototype.isGoal = function (node) {
	const pState = node.state.get("P");
	const pMeta = this.pieceMap.get("P");
	const exit = this.kPosition;
	const { row, col } = pState;
	const { length, orientation } = pMeta;
	if (orientation === "H") {
		if (row !== exit.row) return false;
		if (exit.col < col) {
			return col - 1 === exit.col;
		}
		return col + length === exit.col;
	} else {
		if (col !== exit.col) return false;
		if (exit.row < row) {
			return row - 1 === exit.row;
		}
		return row + length === exit.row;
	}
};

function serializeState(state) {
	return JSON.stringify(
		[...state.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
	);
}

Game.prototype._rebuildBoard = function (state) {
	const grid = Array.from({ length: this.rows }, () =>
		Array(this.cols).fill(null)
	);

	for (const [sym, meta] of this.pieceMap.entries()) {
		const { length, orientation } = meta;
		const { row, col } = state.get(sym);
		for (let i = 0; i < length; ++i) {
			const r = orientation === "H" ? row : row + i;
			const c = orientation === "H" ? col + i : col;

			if (!this._isEmpty(grid, r, c)) {
				grid[r][c] = ".";
			}
			if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
				console.error(`Out of bounds placing '${sym}':`, {
					r,
					c,
					thisRows: this.rows,
					thisCols: this.cols,
				});
			}
			grid[r][c] = sym;
		}
	}
	return grid;
};

Game.prototype._isEmpty = function (grid, r, c) {
	return (
		r >= 0 &&
		r < this.rows &&
		c >= 0 &&
		c < this.cols &&
		grid[r][c] === null
	);
};

Game.prototype.successors = function (node) {
	const next = [];
	const grid = this._rebuildBoard(node.state);

	for (const [sym, meta] of this.pieceMap.entries()) {
		const { length, orientation } = meta;
		const { row, col } = node.state.get(sym);

		for (const dir of [-1, 1]) {
			let dist = 1;
			while (true) {
				const r = orientation === "H" ? row : row + dir * dist;
				const c = orientation === "H" ? col + dir * dist : col;

				let checkR;
				if (orientation === "H") {
					checkR = row;
				} else {
					// V
					if (dir === 1) {
						checkR = row + length - 1 + dist;
					} else {
						checkR = row - dist;
					}
				}

				let checkC;
				if (orientation === "V") {
					checkC = col;
				} else {
					//h
					if (dir === 1) {
						checkC = col + length - 1 + dist;
					} else {
						checkC = col - dist;
					}
				}

				// break kalo nabrak
				if (!this._isEmpty(grid, checkR, checkC)) {
					break;
				}

				const newState = new Map(node.state);
				newState.set(sym, { row: r, col: c });
				next.push(
					new Node(
						newState,
						node,
						{ piece: sym, dir, count: dist },
						node.cost + 1
					)
				);
				dist++;
			}
		}
	}

	return next;
};

// * ======================= HEURISTICS ======================= * //
// Heuristic jarak P ke K
Game.prototype._heuristicDistance = function (state) {
	const pState = state.get("P");

	const piece = this.pieceMap.get("P");
	const { row, col } = pState;

	const len = piece.length;
	const orientation = piece.orientation;

	if (orientation === "H") {
		return this.kPosition.row - (row + len);
	} else if (orientation === "V") {
		return this.kPosition.col - (col + len);
	} else {
		throw new Error("Invalid orientation");
	}
};

// Heuristic blocking car count
Game.prototype._heuristicBlocker = function (state) {
	const grid = this._rebuildBoard(state);
	const pState = state.get("P");

	const piece = this.pieceMap.get("P");
	const { row, col } = pState;
	const len = piece.length;
	const orientation = piece.orientation;
	let blockers = 0;

	if (orientation === "H") {
		for (let c = col + len; c <= this.kPosition.col; c++) {
			if (grid[row][c] !== null) {
				blockers++;
			}
		}
	} else if (orientation === "V") {
		for (let r = row + len; r <= this.kPosition.row; r++) {
			if (grid[r][col] !== null) {
				blockers++;
			}
		}
	} else {
		throw new Error("Unknown orientation for P");
	}

	return blockers;
};

// Composite heuristic (block + distance)
Game.prototype._heuristicComposite = function (state) {
	const grid = this._rebuildBoard(state);
	const pState = state.get("P");
	const piece = this.pieceMap.get("P");
	const { row, col } = pState;
	const len = piece.length;
	const orientation = piece.orientation;

	let distance = 0;
	let blockers = 0;

	if (orientation === "H") {
		distance = this.kPosition.col - (col + len);
		for (let c = col + len; c <= this.kPosition.col; c++) {
			if (grid[row][c] !== null) {
				blockers++;
			}
		}
	} else if (orientation === "V") {
		distance = this.kPosition.row - (row + len);
		for (let r = row + len; r <= this.kPosition.row; r++) {
			if (grid[r][col] !== null) {
				blockers++;
			}
		}
	} else {
		throw new Error("Unknown orientation for P");
	}

	return distance + blockers;
};

// * ======================= ALGORITHMS ======================= * //

Game.prototype.uniformCostSearch = function () {
	const start = this.getInitialNode();

	const frontier = [];
	const push = (n) => {
		frontier.push(n);
		frontier.sort((a, b) => a.cost - b.cost);
	};
	const pop = () => frontier.shift();

	const visited = new Map();

	// stats
	let nodeCount = 0;
	const startTime = Date.now();

	push(start);

	while (frontier.length) {
		const node = pop();
		nodeCount++;

		if (this.isGoal(node)) {
			const endTime = Date.now();
			let runtime = endTime - startTime;
			return {
				path: node.getPath(),
				nodePath: node.getNodePath(),
				runtime,
				nodeCount,
			};
		}

		const key = serializeState(node.state);
		if (visited.has(key) && visited.get(key) <= node.cost) continue;
		visited.set(key, node.cost);

		for (const child of this.successors(node)) push(child);
	}

	return null;
};

Game.prototype.greedyBestFirstSearch = function () {
	const start = this.getInitialNode();

	const frontier = [];
	const push = (n) => {
		frontier.push(n);
		frontier.sort(
			(a, b) => this.heuristicFn(a.state) - this.heuristicFn(b.state)
		);
	};
	const pop = () => frontier.shift();

	const visited = new Set();
	// stats
	let nodeCount = 0;
	const startTime = Date.now();

	push(start);

	while (frontier.length) {
		const node = pop();
		nodeCount++;

		if (this.isGoal(node)) {
			const endTime = Date.now();
			let runtime = endTime - startTime;
			return {
				path: node.getPath(),
				nodePath: node.getNodePath(),
				runtime,
				nodeCount,
			};
		}

		const key = serializeState(node.state);
		if (visited.has(key)) continue;
		visited.add(key);

		for (const child of this.successors(node)) push(child);
	}

	return null;
};

Game.prototype.aStarSearch = function () {
	const start = this.getInitialNode();

	const frontier = [];
	const push = (n) => {
		frontier.push(n);
		frontier.sort(
			(a, b) =>
				a.cost +
				this.heuristicFn(a.state) -
				(b.cost + this.heuristicFn(b.state))
		);
	};
	const pop = () => frontier.shift();

	const visited = new Map();
	let nodeCount = 0;
	const startTime = Date.now();

	push(start);

	while (frontier.length) {
		const node = pop();
		nodeCount++;

		if (this.isGoal(node)) {
			const endTime = Date.now();
			let runtime = endTime - startTime;
			return {
				path: node.getPath(),
				nodePath: node.getNodePath(),
				runtime,
				nodeCount,
			};
		}

		const key = serializeState(node.state);
		if (visited.has(key) && visited.get(key) <= node.cost) continue;
		visited.set(key, node.cost);

		for (const child of this.successors(node)) push(child);
	}

	return null;
};

module.exports = { Game };
