class Node {
  constructor(state, parent = null, move = null, cost = 0) {
    this.state = state; // ini Map<symbol, origin>
    this.parent = parent;
    this.move = move;
    this.cost = cost;
    this.estimatedTotalCost = 0;
  }

  isEqual(otherNode) {
    return JSON.stringify([...this.state.entries()]) === JSON.stringify([...otherNode.state.entries()]);
  }

  getPath() {
    const path = [];
    let current = this;
    while (current.parent) {
      path.push(current.move);
      current = current.parent;
    }
    return path.reverse();
  }
}
