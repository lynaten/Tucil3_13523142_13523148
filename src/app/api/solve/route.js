import { Game } from "@/lib/rush-hour/Game";
import { parseGridStackJSON } from "@/lib/rush-hour/fromGridStack";
import { readInputBoard, boardToString } from "@/lib/rush-hour/parser";
import { extractVehicles } from "@/lib/rush-hour/extractor";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const json = await req.json();
      const gameState = parseGridStackJSON(json);
      const game = new Game(gameState);

      console.log("🧩 Game Initialized (JSON Layout):");
      console.log("Rows:", game.rows);
      console.log("Cols:", game.cols);
      console.log("K Position:", game.kPosition);
      console.log("Number of Vehicles:", game.pieceMap.size);
      console.log("Initial Board:\n" + gameState.stringBoard);

      return new Response("JSON Grid processed", { status: 200 });
    }

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return new Response("Invalid file", { status: 400 });
      }

      const content = await file.text();

      let gameState;
      try {
        const json = JSON.parse(content);
        gameState = parseGridStackJSON(json);
      } catch {
        const parsed = readInputBoard(content);
        const pieceMap = extractVehicles(parsed.board);
        gameState = {
          board: parsed.board,
          rows: parsed.rows,
          cols: parsed.cols,
          kPosition: parsed.kPosition,
          numVehicles: parsed.numVehicles,
          pieceMap,
          stringBoard: boardToString(parsed.board),
        };
      }

      const game = new Game(gameState);

      console.log("🧩 Game Initialized:");
      console.log("Rows:", game.rows);
      console.log("Cols:", game.cols);
      console.log("K Position:", game.kPosition);
      console.log("Number of Vehicles:", game.pieceMap.size);
      console.log("Initial Board:\n" + gameState.stringBoard);

      return new Response("File processed and game initialized", { status: 200 });
    }

    return new Response("Unsupported content type", { status: 415 });
  } catch (e) {
    console.error("❌ Error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
