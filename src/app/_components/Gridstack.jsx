"use client";

import { useState } from "react";
import { GridStackProvider } from "@/lib/grid-stack/grid-stack-provider";
import { useGridStackContext } from "@/lib/grid-stack/grid-stack-context";

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
      locked:true,
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

export function GridStackComponent() {
    const [copiedOptions, setCopiedOptions] = useState("");
    const [widthUnits, setWidthUnits] = useState(6);
    const [cellHeight, setCellHeight] = useState(60);

    const BASE_GRID_OPTIONS = {
        locked:true,
        acceptWidgets: true,
        columnOpts: {
            columnWidth: cellHeight,
            columnMax: 100,
            layout: "moveScale",
            breakpointForWindow: false,
        },
        float: true,
        itemClass: "grid-stack-item",
        margin: 5,
        cellHeight: cellHeight,
        removable: ".trash",

        children: [
            {
                id: "main-sub-grid",
                x: 0,
                y: 0,
                w: 6,
                h: 1,
                locked:true,
                // sizeToContent: true,
                subGridOpts: {
                    acceptWidgets: true,
                    column: "auto",
                    float: true,
                    margin: 5,
                    cellHeight: cellHeight,
                    itemClass: "grid-stack-item",
                    removable: ".trash",
                    layout: "list",
                    minRow: 1,
                },
            },
        ],
        };

    
    return (
        <GridStackProvider initialOptions={BASE_GRID_OPTIONS}>
            <div className="w-fit flex flex-col justify-center items-center">
                <div className="flex flex-col gap-2 items-start mb-2">
                    <label className="text-sm">
                        Grid columns:
                        <input
                        type="number"
                        min="1"
                        value={widthUnits}
                        onChange={(e) => setWidthUnits(parseInt(e.target.value, 10) || 1)}
                        className="border border-gray-300 rounded px-2 py-1 w-20 ml-2"
                        />
                    </label>
                    {/* <label className="text-sm">
                        Cell Height:
                        <input
                        type="number"
                        min="10"
                        value={cellHeight}
                        onChange={(e) => setCellHeight(parseInt(e.target.value, 10) || 10)}
                        className="border border-gray-300 rounded px-2 py-1 w-20 ml-2"
                        />
                    </label> */}
                </div>
               
                <div className="flex h-fit">
                    <AddWidgetButton/>
                    <SaveButton setCopiedOptions={setCopiedOptions} />
                    <div className="trash w-10 h-10 bg-red-300 flex justify-center items-center">
                        🗑️
                    </div>
                </div>
                <div style={{ width: `${widthUnits * cellHeight}px` }} className="max-w-screen overflow-x-auto mb-16">
                    <GridstackInner />
                </div>
                
                {copiedOptions && (
                    <div style={{ width: `${widthUnits * cellHeight}px` }} className="max-w-screen mt-4 p-2 bg-gray-100 text-sm whitespace-pre-wrap break-all border border-gray-300 rounded">
                        <strong>Saved Grid (JSON):</strong>
                        <pre className=" whitespace-pre-wrap break-all">{JSON.stringify(copiedOptions, null, 2)}</pre>
                    </div>
                )}
            </div>
            
        </GridStackProvider>
    );
}
