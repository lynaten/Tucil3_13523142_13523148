import { Game } from "@/lib/rush-hour/Game";
import { parseGridStackJSON } from "@/lib/rush-hour/fromGridStack";
import { readInputBoard, boardToString } from "@/lib/rush-hour/parser";
import { extractVehicles } from "@/lib/rush-hour/extractor";

export async function POST(req) {
  const url     = new URL(req.url);
  const solverQ = url.searchParams.get("solver");
  let gameState;

  if (!solverQ) {
    return new Response(
      JSON.stringify({ error: "Missing solver query parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json();
      gameState  = parseGridStackJSON(json);
    }
    else if (contentType.includes("multipart/form-data")) {
      const form    = await req.formData();
      const file    = form.get("file");
      if (!file || typeof file === "string") {
        throw new Error("Invalid file upload");
      }
      const text    = await file.text();
      const parsed  = readInputBoard(text);
      const pieceMap = extractVehicles(parsed.board);
      gameState     = {
        ...parsed,
        pieceMap,
        stringBoard: boardToString(parsed.board),
      };
    }
    else {
      throw new Error("Unsupported content type");
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const game = new Game(gameState);
  console.log("🧩 Game Initialized:");
  console.log("Rows:", game.rows);
  console.log("Cols:", game.cols);
  console.log("K Position:", game.kPosition);
  console.log("Number of Vehicles:", game.pieceMap.size);
  console.log("Initial Board:\n" + gameState.stringBoard);

  const solvers = {
    ucs:    () => game.uniformCostSearch(),
    greedy: () => game.greedyBestFirstSearch(),
    astar:  () => game.aStarSearch(),
  };

  const key = solverQ.toLowerCase();
  const fn  = solvers[key];
  if (!fn) {
    return new Response(
      JSON.stringify({ error: `Unknown solver "${solverQ}"` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const path = fn() || [];
  const board = game.board;
  const kPosition = game.kPosition;  
  return new Response(
    JSON.stringify({ path, board, kPosition }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
