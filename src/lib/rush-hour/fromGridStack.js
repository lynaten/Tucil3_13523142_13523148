const { extractVehicles } = require("./extractor");

function parseGridStackJSON(gridJson) {
  const subGrid     = gridJson.children.find(c => c.id === "main-sub-grid");
  const mainWidgets = gridJson.children.filter(c => c.id !== "main-sub-grid");
  const kWidget     = mainWidgets.find(w => w.id === "K");

  const rows = subGrid.h;
  const cols = subGrid.w;

  const board = Array.from({ length: rows }, () => Array(cols).fill("."));

  const children = Array.isArray(subGrid.subGridOpts.children)
    ? subGrid.subGridOpts.children
    : [];

  for (const w of children) {
    if (!w || w.sizeToContent) continue;
    const { id, x, y, w: wW = 1, h: wH = 1 } = w;
    for (let dy = 0; dy < wH; ++dy) {
      for (let dx = 0; dx < wW; ++dx) {
        const r = y + dy;
        const c = x + dx;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          board[r][c] = id;
        }
      }
    }
  }

  let kPosition = null;
  if (kWidget) {
    const { x: Kx, y: Ky, w: Kw = 1, h: Kh = 1 } = kWidget;
    let row, col;

    if (Ky + Kh <= subGrid.y) {
      row = -1;
      col = Kx - subGrid.x;
    }
    else if (Ky >= subGrid.y + subGrid.h) {
      row = rows;
      col = Kx - subGrid.x;
    }
    else if (Kx + Kw <= subGrid.x) {
      col = -1;
      row = Ky - subGrid.y;
    }
    else if (Kx >= subGrid.x + subGrid.w) {
      col = cols;
      row = Ky - subGrid.y;
    }
    else {
      row = Ky - subGrid.y;
      col = Kx - subGrid.x;
    }

    kPosition = { row, col };
  }

  const pieceMap = extractVehicles(board);

  return {
    board,
    rows,
    cols,
    kPosition,
    numVehicles: pieceMap.size,
    pieceMap,
    stringBoard: board.map(r => r.join("")).join("\n"),
  };
}

module.exports = { parseGridStackJSON };
