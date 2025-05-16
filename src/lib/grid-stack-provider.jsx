"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
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
      // Initialize GridStack if needed
      // const gs = GridStackLib.init(initialOptions, containerRef.current);
      // setGridStack(gs);
    }
  }, [gridStack, initialOptions]);

  const genRandomId = () =>
    `widget-${Math.random().toString(36).substring(2, 15)}`;

  const addWidget = useCallback(
    (fn) => {
      const newId = genRandomId();
      console.log("🆕 Generated new widget ID:", newId);

      const widget = fn(newId);

      console.group(`📦 Debugging widget for ID: ${newId}`);
      console.log("➡ Full Widget:", widget);
      console.log("📏 Dimensions:", {
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
      });
      console.log("📜 Content:", widget.content ?? "❌ No content");
      if (widget.subGridOpts) {
        console.log("🔁 SubGrid Options:", widget.subGridOpts);
      }
      console.groupEnd();

      if (gridStack) {
        console.log("🧱 gridStack is ready. Adding widget to GridStack...");
        gridStack.addWidget({ ...widget, id: newId });
      } else {
        console.warn("⚠️ gridStack is null. Skipping gridStack.addWidget.");
      }

      setRawWidgetMetaMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(newId, widget);
        console.log("📝 Updated rawWidgetMetaMap with ID:", newId);
        return newMap;
      });
    },
    [gridStack]
  );

  const addSubGrid = useCallback(
    (fn) => {
      const subGridId = `sub-grid-${Math.random().toString(36).substring(2, 15)}`;
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
    (id, x, y) => {
      if (!gridStack) return;
      const el = document.querySelector(`[gs-id="${id}"]`);
      if (el) {
        gridStack.update(el, { x, y });
      }
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
