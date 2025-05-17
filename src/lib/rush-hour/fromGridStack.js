const { extractVehicles } = require("./extractor");

function parseGridStackJSON(gridJson) {
  const subGrid = gridJson.children.find((c) => c.id === "main-sub-grid");
  const mainWidgets = gridJson.children.filter((c) => c.id !== "main-sub-grid");

  const rows = subGrid.h;
  const cols = subGrid.w;

  const board = Array.from({ length: rows }, () => Array(cols).fill("#"));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      board[y][x] = ".";
    }
  }

  for (const widget of subGrid.subGridOpts.children) {
    const { id, x, y, w = 1, h = 1 } = widget;
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const row = y + dy;
        const col = x + dx;
        if (row < rows && col < cols) {
          board[row][col] = id;
        }
      }
    }
  }

  const kWidget = mainWidgets.find((w) => w.id === "K");
  const kPosition = kWidget ? { row: kWidget.y, col: kWidget.x } : null;

  if (kPosition && kPosition.row < rows && kPosition.col < cols) {
    board[kPosition.row][kPosition.col] = "K";
  }
  console.log("🧾 Pretty Printed Board:\n" + board.map(row => row.join(" ")).join("\n"));
  const pieceMap = extractVehicles(board);

  return {
    board,
    rows,
    cols,
    kPosition,
    numVehicles: pieceMap.size,
    pieceMap,
    stringBoard: board.map((r) => r.join("")).join("\n"),
  };
}

module.exports = { parseGridStackJSON };
