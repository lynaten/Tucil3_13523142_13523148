export class Node {
	/**
	 * @param {any} state - Representasi board Rush Hour
	 * @param {Node|null} parent - Node induk
	 * @param {string|null} move - Langkah yang dilakukan untuk mencapai state ini
	 * @param {number} cost - Total langkah sejauh ini
	 */
	constructor(board, state, pieceMap, parent = null, move = null, cost = 0) {
		this.board = board;
		this.state = state;
		this.pieceMap = pieceMap;
		this.parent = parent;
		this.move = move;
		this.cost = cost;
		this.estimatedTotalCost = 0;
	}

	getPath() {
		const path = [];
		let current = this;
		while (current.parent !== null) {
			path.push(current.move);
			current = current.parent;
		}
		return path.reverse();
	}

	isEqual(otherNode) {
		return JSON.stringify(this.state) === JSON.stringify(otherNode.state);
	}
}
