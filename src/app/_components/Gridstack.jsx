"use client";

import { useState } from "react";
import { GridStackProvider } from "@/lib/grid-stack-provider";
import { useGridStackContext } from "@/lib/grid-stack-context";

import "gridstack/dist/gridstack.css";
import "../../styles/gridstackreact.css";
import GridstackInner from "./Gridstackinner";

const COLORS = [
  "bg-pink-500",
  "bg-rose-400",
  "bg-orange-600",
  "bg-indigo-600",
  "bg-emerald-500",
  "bg-yellow-600",
  "bg-red-700",
  "bg-blue-400",
  "bg-purple-400",
  "bg-orange-700",
  "bg-green-400",
  "bg-fuchsia-400",
  "bg-purple-600",
  "bg-yellow-400",
  "bg-emerald-600",
  "bg-fuchsia-600",
  "bg-indigo-400",
  "bg-pink-400",
  "bg-red-600",
  "bg-teal-500",
  "bg-teal-400",
  "bg-green-600",
  "bg-yellow-500",
  "bg-fuchsia-500",
  "bg-purple-500",
  "bg-blue-600",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-pink-600",
  "bg-rose-600",
  "bg-emerald-400",
  "bg-red-500",
  "bg-blue-500",
  "bg-rose-500",
  "bg-teal-600",
];

function SaveButton({ setCopiedOptions }) {
  const { saveOptions } = useGridStackContext();

  const handleSave = () => {
    const saved = saveOptions?.();
    if (saved && typeof saved === "object" && "children" in saved) {
      console.log("📦 Saved Grid:", saved);
      setCopiedOptions?.(structuredClone(saved));
    } else {
      console.warn("⚠️ Failed to save grid state:", saved);
    }
  };

  return (
    <button onClick={handleSave} className="bg-green-600 px-4 py-2 text-white">
      💾 Save Grid
    </button>
  );
}

export function AddWidgetButton() {
  const { addWidget, gridStack } = useGridStackContext();
  const [index, setIndex] = useState(0);

  const handleAdd = () => {
    const color = COLORS[index % COLORS.length];
    const widget = {
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      content: JSON.stringify({
        name: "Block",
        props: {
          color,
        },
      }),
    };

    if (gridStack?.willItFit(widget)) {
      addWidget(() => widget);
      setIndex((prev) => (prev + 1) % COLORS.length);
    } else {
      alert("Grid is full. Cannot add more widgets.");
    }
  };

  return (
    <button onClick={handleAdd} className="bg-blue-600 px-4 py-2 text-white">
      ➕ Add Widget
    </button>
  );
}

export function GridStackComponent({ initialOptions }) {
  return (
    <GridStackProvider initialOptions={initialOptions}>
      <AddWidgetButton />
      <GridstackInner />
    </GridStackProvider>
  );
}
