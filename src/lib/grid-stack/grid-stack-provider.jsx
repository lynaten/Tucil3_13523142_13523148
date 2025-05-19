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
		if (Array.isArray(obj.subGridOpts?.children)) {
		obj.subGridOpts.children.forEach(deepFindNodeWithContent);
		}
	};

	if (Array.isArray(initialOptions?.children)) {
		initialOptions.children.forEach(deepFindNodeWithContent);
	}

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
			setGridStack(existingInstance);
		}
	}, [gridStack]);

	const genRandomId = () =>
		`widget-${Math.random().toString(36).substring(2, 15)}`;

	const addWidget = useCallback(
	(fn, targetId) => {
		const tempW = fn();
		const newId = tempW.id ?? genRandomId();
		const widget = fn(newId);
		widget.id = newId;

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

		if (!isReplace && !target.willItFit(widget)) {
			console.warn(`No space to place widget "${newId}"`);
			return;
		}

		if (isReplace) {
			try {
			target.removeWidget(document.querySelector(`[gs-id="${newId}"]`));
			} catch (e) {
			console.warn(`Failed to remove old widget ${newId}:`, e);
			}
		}

		const el = target.addWidget({ ...widget, id: newId });

		if (el?.gridstackNode) {
			const all = target.getGridItems().filter((i) => i !== el);

			const taken = new Set();

			for (const i of all) {
			const n = i.gridstackNode;
			if (!n) continue;

			for (let dx = 0; dx < n.w; dx++) {
				for (let dy = 0; dy < n.h; dy++) {
					taken.add(`${n.x + dx},${n.y + dy}`);
				}
			}
			}


			const { w: newW = 1, h: newH = 1 } = el.gridstackNode ?? widget;
			let x = 0;
			let y = 0;
			const maxCols = target.getColumn();

			outer: for (y = 0; y < 100; y++) {
				for (x = 0; x <= maxCols - newW; x++) {
					let fits = true;

					for (let dx = 0; dx < newW; dx++) {
						for (let dy = 0; dy < newH; dy++) {
							if (taken.has(`${x + dx},${y + dy}`)) {
								fits = false;
								break;
							}
						}
					if (!fits) break;
					}

					if (fits) break outer;
				}
			}
			
			const oldAnimate = target.opts.animate;
			target.opts.animate = false;

			target.update(el, { x, y, autoPosition: false  });

			target.opts.animate = oldAnimate;
		}
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

	const addWidgetNormal = useCallback(
	(widgetOrFn, targetId) => {
		const widget =
		typeof widgetOrFn === "function" ? widgetOrFn() : widgetOrFn;
		const newId = widget.id ?? genRandomId();
		widget.id = newId;

		const isReplace = rawWidgetMetaMap.has(newId);

		if (!gridStack) {
		console.warn("gridStack is null—skipping layout update.");
		return;
		}

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

		if (!isReplace && !target.willItFit(widget)) {
		console.warn(`No space to place widget "${newId}"`);
		return;
		}

		if (isReplace) {
		const existingEl = document.querySelector(`[gs-id="${newId}"]`);
		if (existingEl) {
			try {
			target.removeWidget(existingEl);
			} catch (e) {
			console.warn(`Failed to remove existing widget ${newId}:`, e);
			}
		} else {
			console.warn(`⚠️ Widget with id ${newId} not found for removal.`);
		}
		}

		target.addWidget({ ...widget, id: newId });

		setRawWidgetMetaMap((prev) => {
		const next = new Map(prev);
		next.set(newId, widget);
		return next;
		});
	},
	[gridStack, rawWidgetMetaMap]
	);

	const setCellSize = useCallback((size) => {
	if (!gridStack) return;

	const columnWidth = typeof size === 'number' ? size : parseInt(size, 10);

	gridStack.cellHeight(size);
	gridStack.opts.columnOpts = {
		...(gridStack.opts.columnOpts || {}),
		columnWidth,
	};
	gridStack.column(gridStack.getColumn());

	const subGridEl = gridStack.el.querySelector('[gs-id="main-sub-grid"] .grid-stack');
	const subGrid = subGridEl?.gridstack;
	if (subGrid) {
		subGrid.cellHeight(size);
		subGrid.opts.columnOpts = {
		...(subGrid.opts.columnOpts || {}),
		columnWidth,
		};
		subGrid.column(subGrid.getColumn());
	}
	}, [gridStack]);


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

	const removeAllWidgetsExceptMainSubGrid = useCallback(() => {
	if (!gridStack) {
		console.warn("[GridStack] ❌ gridStack instance belum siap.");
		return;
	}

	console.log("[GridStack] 🔁 Removing all widgets except main-sub-grid");

	const allItems = gridStack.getGridItems();
	console.log("[GridStack] Total main grid items:", allItems.length);

	allItems.forEach((item) => {
		const id = item.gridstackNode?.id;
		console.log("🧩 Found main grid item ID:", id);

		if (id && id !== "main-sub-grid") {
		console.log("🗑️ Removing main item:", id);
		gridStack.removeWidget(item);
		}
	});

	const mainSubGridEl = gridStack.el.querySelector('[gs-id="main-sub-grid"]');
	if (!mainSubGridEl) {
		console.warn("⚠️ main-sub-grid element not found in DOM!");
		return;
	}

	const subGridEl = mainSubGridEl.querySelector(".grid-stack");
	if (!subGridEl) {
		console.warn("⚠️ sub-grid (.grid-stack) inside main-sub-grid not found.");
		return;
	}

	const subInstance = subGridEl.gridstack;
	if (!subInstance) {
		console.warn("⚠️ sub-grid instance (gridstack) not attached.");
		return;
	}

	const subItems = subInstance.getGridItems();
	console.log("[GridStack] Subgrid has", subItems.length, "items");

	subItems.forEach((subItem) => {
		const subId = subItem.gridstackNode?.id;
		console.log("🗑️ Removing sub-grid item:", subId);
		subInstance.removeWidget(subItem);
	});
	}, [gridStack]);


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



	const resizeWidget = useCallback(
		(id, size = {}) => {
		if (!gridStack) return;

		const el = document.querySelector(`[gs-id="${id}"]`);
		if (!el) {
			console.warn(`resizeWidget: no element found for id "${id}"`);
			return;
		}

		const gs = el.closest(".grid-stack")?.gridstack;
		if (!gs) {
			console.error("resizeWidget: GridStack instance not found for", id);
			return;
		}

		const { x, y, w, h } = el.gridstackNode;
		gs.update(el, {
			x: size.x ?? x,
			y: size.y ?? y,
			w: size.w ?? w,
			h: size.h ?? h,
		});
		},
		[gridStack]
	);

	const resizeGrid = useCallback(
		({ cols, rowH, targetId } = {}) => {
		if (!gridStack) return;
		let gs = gridStack;

		if (targetId) {
			const subEl = gridStack.el.querySelector(
			`[gs-id="${targetId}"] .grid-stack`
			);
			if (subEl?.gridstack) {
			gs = subEl.gridstack;
			} else {
			console.warn(
				subEl
				? `resizeGrid: sub-grid "${targetId}" not ready`
				: `resizeGrid: no sub-grid "${targetId}" – using root`
			);
			}
		}

		if (cols !== undefined) gs.column(cols);
		if (rowH !== undefined) gs.cellHeight(rowH);
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
				addWidgetNormal,
				removeAllWidgetsExceptMainSubGrid,
				removeWidget,
				moveWidget,
				addSubGrid,
				setCellSize,
				resizeGrid,
				resizeWidget,
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
