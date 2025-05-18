import { Game } from "@/lib/rush-hour/Game";
import { parseGridStackJSON } from "@/lib/rush-hour/fromGridStack";
import { readInputBoard, boardToString } from "@/lib/rush-hour/parser";
import { extractVehicles } from "@/lib/rush-hour/extractor";

async function runAllSolvers(gameState) {
  const game = new Game(gameState);

  console.log("🧩 Game Initialized:");
  console.log("Rows:", game.rows);
  console.log("Cols:", game.cols);
  console.log("K Position:", game.kPosition);
  console.log("Number of Vehicles:", game.pieceMap.size);
  console.log("Initial Board:\n" + gameState.stringBoard);

  const solvers = [
    { name: "UCS",   fn: () => game.uniformCostSearch() },
    { name: "Greedy",fn: () => game.greedyBestFirstSearch() },
    { name: "A*",    fn: () => game.aStarSearch() },
  ];

  for (const { name, fn } of solvers) {
    const path = fn();
    if (path) {
      console.log(`${name} solution found in ${path.length} moves:`);
      console.table(path);
    } else {
      console.log(`No solution for ${name}`);
    }
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let gameState;

    if (contentType.includes("application/json")) {
      const json = await req.json();
      gameState   = parseGridStackJSON(json);
    }
    else if (contentType.includes("multipart/form-data")) {
      const form    = await req.formData();
      const file    = form.get("file");
      if (!file || typeof file === "string") {
        return new Response("Invalid file upload", { status: 400 });
      }

      const text = await file.text();
      try {
        const json = JSON.parse(text);
        gameState  = parseGridStackJSON(json);
      } catch {
        const parsed     = readInputBoard(text);
        const pieceMap   = extractVehicles(parsed.board);
        gameState        = {
          ...parsed,
          pieceMap,
          stringBoard: boardToString(parsed.board),
        };
      }
    }
    else {
      return new Response("Unsupported content type", { status: 415 });
    }

    await runAllSolvers(gameState);
    return new Response("Game processed", { status: 200 });
  }
  catch (err) {
    console.error("❌ Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}