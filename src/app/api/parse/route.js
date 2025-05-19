import { readInputBoard, boardToString } from "@/lib/rush-hour/parser";
import { extractVehicles } from "@/lib/rush-hour/extractor";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Expected multipart/form-data");
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      throw new Error("Invalid file upload");
    }

    const text = await file.text();
    const parsed = readInputBoard(text);

    const pieceMap = extractVehicles(parsed.board);
    const stringBoard = boardToString(parsed.board);

    return new Response(
      JSON.stringify({
        ...parsed,
        pieceMap: Object.fromEntries(pieceMap),
        stringBoard,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
