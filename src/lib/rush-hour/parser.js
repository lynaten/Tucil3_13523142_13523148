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
  const lines        = inputText.trim().split(/\r?\n/);
  const [rows, cols] = lines[0].split(" ").map(Number);
  const numVehicles  = Number(lines[1]);
  const rawRows      = lines.slice(2);

  let kPosition = null;

  if (rawRows.length === rows + 1 && rawRows[0].includes("K")) {
    const kCol = rawRows[0].indexOf("K");
    kPosition  = { row: -1, col: kCol };
    rawRows.shift();
  }
  else if (rawRows.length === rows + 1 && rawRows[rows].includes("K")) {
    const kCol = rawRows[rows].indexOf("K");
    kPosition  = { row: rows, col: kCol };
    rawRows.pop();
  }

  for (let r = 0; r < rows && !kPosition; ++r) {
    let line = (rawRows[r] || "").trimStart();
    rawRows[r] = line;

    if (line.length === cols + 1 && line[0] === "K") {
      kPosition  = { row: r, col: -1 };
      rawRows[r] = line.slice(1);
      break;
    }
    if (line.length === cols + 1 && line[cols] === "K") {
      kPosition  = { row: r, col: cols };
      rawRows[r] = line.slice(0, cols);
      break;
    }
  }

  if (!kPosition) {
    throw new Error("No exit 'K' found on any side");
  }

  const board = rawRows.slice(0, rows).map(line => {
    const rowStr = line
      .padEnd(cols, ".")
      .slice(0, cols);
    return Array.from(rowStr, c => c === " " ? "." : c);
  });

  return {
    rows,
    cols,
    numVehicles,
    board,
    kPosition
  };
}


// TESTING
// const parsedInput = readInputBoard(inputText);

// console.log(parsedInput);

// console.log("\nStringified:\n" + boardToString(parsedInput.board));

module.exports = { readInputBoard, boardToString };
