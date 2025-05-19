const { Node } = require("./node");

class Game {
	constructor(gameState) {
		this.rows = gameState.rows;
		this.cols = gameState.cols;
		this.kPosition = gameState.kPosition;
		this.pieceMap = gameState.pieceMap;
		this.board = gameState.board;
	}

	getInitialNode() {
		const initialState = new Map(
			[...this.pieceMap.entries()].map(([s, v]) => [s, v.origin])
		);
		return new Node(initialState);
	}
}

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

		{
			const r = orientation === "H" ? row : row - 1;
			const c = orientation === "H" ? col - 1 : col;
			const tailOk = this._isEmpty(grid, r, c);
			if (tailOk) {
				const newState = new Map(node.state);
				newState.set(sym, { row: r, col: c });
				next.push(
					new Node(
						newState,
						node,
						{ piece: sym, dir: -1 },
						node.cost + 1
					)
				);
			}
		}

		{
			const r = orientation === "H" ? row : row + length;
			const c = orientation === "H" ? col + length : col;
			const headOk = this._isEmpty(grid, r, c);
			if (headOk) {
				const newState = new Map(node.state);
				newState.set(sym, {
					row: orientation === "H" ? row : row + 1,
					col: orientation === "H" ? col + 1 : col,
				});
				next.push(
					new Node(
						newState,
						node,
						{ piece: sym, dir: +1 },
						node.cost + 1
					)
				);
			}
		}
	}

	return next;
};

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

Game.prototype._heuristic = function (state) {
	const { col } = state.get("P");
	const len = this.pieceMap.get("P").length;
	return this.kPosition.col - (col + len);
};

Game.prototype.greedyBestFirstSearch = function () {
	const start = this.getInitialNode();

	const frontier = [];
	const push = (n) => {
		frontier.push(n);
		frontier.sort(
			(a, b) => this._heuristic(a.state) - this._heuristic(b.state)
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
				this._heuristic(a.state) -
				(b.cost + this._heuristic(b.state))
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
