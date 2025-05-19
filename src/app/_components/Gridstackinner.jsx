"use client";

import React, { useEffect } from "react";
import { GridStackRenderProvider } from "@/lib/grid-stack/grid-stack-render-provider";

import { GridStackRender } from "@/lib/grid-stack/grid-stack-render";
import { COMPONENT_MAP } from "@/lib/grid-stack/component-map";
import { useGridStackContext } from "@/lib/grid-stack/grid-stack-context";

const COLORS = [
	"bg-pink-200",
	"bg-rose-200",
	"bg-orange-200",
	"bg-indigo-200",
	"bg-emerald-200",
	"bg-yellow-200",
	"bg-blue-200",
	"bg-purple-200",
	"bg-green-200",
	"bg-fuchsia-200",
	"bg-purple-200",
	"bg-yellow-200",
	"bg-emerald-200",
	"bg-indigo-200",
	"bg-pink-200",
	"bg-teal-200",
	"bg-teal-200",
	"bg-fuchsia-200",
	"bg-purple-200",
	"bg-blue-200",
	"bg-orange-200",
	"bg-pink-200",
	"bg-cyan-200",
];

const InnerRenderer = ({ parsedGame, setWidthUnits, setHeightUnits }) => {
  const { addWidgetNormal,removeAllWidgetsExceptMainSubGrid, gridStack, resizeWidget } = useGridStackContext();

  const handleAddKFromParsedGame = () => {
    if (!parsedGame?.kPosition || !gridStack) return;
    const id = "K";
    const color = "bg-green-500";
    const text = id;

    const widget = {
      id,
      x: parsedGame.kPosition.col + 1, // +1 karena subgrid mulai dari (1,1)
      y: parsedGame.kPosition.row + 1,
      w: 1,
      h: 1,
      locked: true,
      noResize: true,
      group: "main",
      content: JSON.stringify({
        name: "Block",
        props: { color, text },
      }),
    };

    if (gridStack.willItFit(widget)) {
        addWidgetNormal(() => widget);
    } else {
      console.warn("⚠️ Grid is full, K cannot be added.");
    }
  };

  useEffect(() => {
    if (!parsedGame || !gridStack) return;

    requestAnimationFrame(() => {
      removeAllWidgetsExceptMainSubGrid();

      setWidthUnits(parsedGame.cols + 2);
      setHeightUnits(parsedGame.rows + 2);

      const mainSubGridEl = document.querySelector('[gs-id="main-sub-grid"]');
      if (mainSubGridEl?.gridstackNode) {
        resizeWidget("main-sub-grid", { h: parsedGame.rows });
      } else {
        console.warn("⚠️ main-sub-grid widget not found to resize.");
      }

      const subEl = gridStack.el.querySelector('[gs-id="main-sub-grid"] .grid-stack');
      const subGrid = subEl?.gridstack;

      if (!subGrid) {
        console.warn("⚠️ Subgrid is not ready yet.");
        return;
      }

      setTimeout(() => {
        let colorIndex = 0;

        for (const [id, info] of Object.entries(parsedGame.pieceMap)) {
          const isPrimary = info.isPrimary;
          const color = isPrimary ? "bg-red-500" : COLORS[colorIndex % COLORS.length];
          const textColor = isPrimary ? "text-white" : undefined;
          if (!isPrimary) colorIndex++;

          const widget = {
            id,
            x: info.origin.col,
            y: info.origin.row,
            w: info.width,
            h: info.height,
            locked: true,
            group: "sub",
            content: JSON.stringify({
              name: "Block",
              props: {
                text: id,
                color,
                textColor,
              },
            }),
          };

          addWidgetNormal(() => ({
            ...widget,
            sizeToContent: false,
          }), "main-sub-grid");
        }
        handleAddKFromParsedGame();
      }, 300);
    
    });
  }, [parsedGame, gridStack]);


  return <GridStackRender componentMap={COMPONENT_MAP} />;
};

const GridstackInner = ({ parsedGame, setWidthUnits, setHeightUnits }) => {
  return (
    <GridStackRenderProvider>
      <InnerRenderer parsedGame={parsedGame} setWidthUnits={setWidthUnits} setHeightUnits={setHeightUnits} />
    </GridStackRenderProvider>
  );
};

export default GridstackInner;
