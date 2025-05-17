const fs = require("fs");
const { readInputBoard, boardToString } = require("./parser");
const { extractVehicles } = require("./extractor");

const inputPath = process.argv[2];
if (!inputPath) {
	console.error("File input invalid!");
	process.exit(1);
}

const inputText = fs.readFileSync(inputPath, "utf-8");

const parsed = readInputBoard(inputText);
const stringParsed = boardToString(parsed.board);

console.log("Parsed board:");
console.log(parsed.board);
console.log("Dimension: ", parsed.rows, "x", parsed.cols);
console.log("Number of Vehicles: ", parsed.numVehicles);
console.log("K position: ", parsed.kPosition);

console.log("String board: ");
console.log(stringParsed);

const vehicleMap = extractVehicles(parsed.board);

console.log("Extracted Vehicles:");
for (const [symbol, info] of vehicleMap.entries()) {
	console.log(symbol, info);
}
