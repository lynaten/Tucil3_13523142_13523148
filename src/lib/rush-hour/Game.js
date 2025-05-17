class Game {
  constructor(gameState) {
    this.rows = gameState.rows;
    this.cols = gameState.cols;
    this.kPosition = gameState.kPosition;
    this.pieceMap = gameState.pieceMap;
    this.board = gameState.board;
  }

  isGoal(node) {
    const p = node.state.get("P");
    const len = this.pieceMap.get("P").length;
    return p.col + len === this.kPosition.col;
  }

  getInitialNode() {
    const initialState = new Map(
      [...this.pieceMap.entries()].map(([s, v]) => [s, v.origin])
    );
    return new Node(initialState);
  }

}

module.exports = { Game };
