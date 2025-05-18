"use client";

import React, { useCallback, useRef, useState, useLayoutEffect } from "react";
import { GridStackContext } from "./grid-stack-context";

/** @type {import("gridstack")} */
// const GridStackLib = require("gridstack"); // Uncomment if needed

export function GridStackProvider({ children, initialOptions }) {
	const [gridStack, setGridStack] = useState(null);

	const [rawWidgetMetaMap, setRawWidgetMetaMap] = useState(() => {
		const map = new Map();

		const deepFindNodeWithContent = (obj) => {
			if (obj.id && obj.content) {
				map.set(obj.id, obj);
			}
			if (obj.subGridOpts?.children) {
				obj.subGridOpts.children.forEach((child) => {
					deepFindNodeWithContent(child);
				});
			}
		};

		initialOptions.children?.forEach((child) => {
			deepFindNodeWithContent(child);
		});

		return map;
	});

	const containerRef = useRef(null);

	useLayoutEffect(() => {
		if (!gridStack && containerRef.current) {
			const rootGridEl =
				containerRef.current.querySelector(".grid-stack");
			const existingInstance = rootGridEl?.gridstack;

			if (!existingInstance) {
				console.warn(
					"No GridStack instance found in .grid-stack under containerRef"
				);
				return;
			}

      existingInstance.on("removed", (_, items) => {
        items.forEach((item) => {
          const id = item.id;
          if (id) removeWidget(id);
        });
      });

      existingInstance.on("change", (_, items) => {
        items.forEach((item) => {
          const el = item.el;
          const id = el?.gridstackNode?.id;

          if (id !== "main-sub-grid") return;

          const subGridEl = el.querySelector(".grid-stack");
          const subInstance = subGridEl?.gridstack;
          if (!subInstance) {
            console.warn("⚠️ subgrid instance not found");
            return;
          }

          const subItems = subInstance.getGridItems();
          subItems.forEach((subItem) => {
            subInstance.removeWidget(subItem);
          });
        });
      });

			existingInstance.on("resizestart", (_, el) => {
				const id = el?.gridstackNode?.id;
        

				if (id !== "main-sub-grid") return;

				const subGridEl = el.querySelector(".grid-stack");
				const subInstance = subGridEl?.gridstack;
				if (!subInstance) {
					console.warn("⚠️ subgrid instance not found");
					return;
				}

				const items = subInstance.getGridItems();
        items.forEach((item) => {
          subInstance.removeWidget(item);
        });
			});

			setGridStack(existingInstance);
		}
	}, [gridStack]);

	const genRandomId = () =>
		`widget-${Math.random().toString(36).substring(2, 15)}`;

  const addWidget = useCallback(
    (fn, targetId) => {
      const tempW  = fn();
      const newId  = tempW.id ?? genRandomId();
      const widget = fn(newId);
      widget.id    = newId;

      const isReplace = rawWidgetMetaMap.has(newId);

      if (gridStack) {
        let target = gridStack;
        if (targetId) {
          const subEl = gridStack.el.querySelector(
            `[gs-id="${targetId}"] .grid-stack`
          );
          if (subEl?.gridstack?.addWidget) {
            target = subEl.gridstack;
          } else {
            console.warn(
              subEl
                ? `Sub-grid for "${targetId}" not ready, using root.`
                : `No sub-grid for "${targetId}", using root.`
            );
          }
        }

        if (isReplace) {
          try {
            target.removeWidget(
              document.querySelector(`[gs-id="${newId}"]`)
            );
          } catch (e) {
            console.warn(`Failed to remove old widget ${newId}:`, e);
          }
        }

        target.addWidget({ ...widget, id: newId });
      } else {
        console.warn("gridStack is null—skipping layout update.");
      }

      setRawWidgetMetaMap((prev) => {
        const next = new Map(prev);
        next.set(newId, widget);
        return next;
      });
    },
    [gridStack, rawWidgetMetaMap]
  );

	const addSubGrid = useCallback(
		(fn) => {
			const subGridId = `sub-grid-${Math.random()
				.toString(36)
				.substring(2, 15)}`;
			const subWidgetIdMap = new Map();
 
			const widget = fn(subGridId, (w) => {
				const subId = genRandomId();
				subWidgetIdMap.set(subId, w);
				return { ...w, id: subId };
			});

			if (gridStack) {
				gridStack.addWidget({ ...widget, id: subGridId });
			}

			setRawWidgetMetaMap((prev) => {
				const newMap = new Map(prev);
				subWidgetIdMap.forEach((meta, id) => {
					newMap.set(id, meta);
				});
				return newMap;
			});
		},
		[gridStack]
	);

	const removeWidget = useCallback(
		(id) => {
			if (gridStack) {
				gridStack.removeWidget(id);
			}
			setRawWidgetMetaMap((prev) => {
				const newMap = new Map(prev);
				newMap.delete(id);
				return newMap;
			});
		},
		[gridStack]
	);

const moveWidget = useCallback(
  (id, dx = 0, dy = 0) => {
    if (!gridStack) return;
    const el = gridStack.el.querySelector(`[gs-id="${id}"]`);
    if (!el) {
      console.warn(`No widget with id="${id}" found`);
      return;
    }
    const gridEl = el.closest(".grid-stack");
    const gsInst = gridEl?.gridstack;
    if (!gsInst) {
      console.error("Couldn't find GridStack instance for", id);
      return;
    }
    const { x, y, w, h } = el.gridstackNode;
    gsInst.update(el, {
      x: x + dx,
      y: y + dy,
      w,
      h,
    });
    setRawWidgetMetaMap((prev) => {
      const next = new Map(prev);
      const info = next.get(id);
      if (info) next.set(id, { ...info, x: x + dx, y: y + dy });
        return next;
      });
    },
    [gridStack]
  );

	const saveOptions = useCallback(() => {

		return gridStack?.save(true, true, (_, widget) => widget);
	}, [gridStack]);

	return (
		<GridStackContext.Provider
			value={{
				initialOptions,
				gridStack,
				addWidget,
				removeWidget,
				moveWidget,
				addSubGrid,
				saveOptions,
				_gridStack: {
					value: gridStack,
					set: setGridStack,
				},
				_rawWidgetMetaMap: {
					value: rawWidgetMetaMap,
					set: setRawWidgetMetaMap,
				},
			}}
		>
			<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
				{children}
			</div>
		</GridStackContext.Provider>
	);
}
