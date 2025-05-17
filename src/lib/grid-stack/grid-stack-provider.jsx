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
  (fn, targetId) => {
    const tempWidget = fn();
    const newId = tempWidget.id ?? genRandomId();
    const widget = fn(newId);
    widget.id = newId;

    if (gridStack) {
      let target = gridStack;

      if (targetId) {
        const subGridEl = gridStack.el.querySelector(`[gs-id="${targetId}"] .grid-stack`);
        
        if (subGridEl) {
          const subGridInstance = subGridEl.gridstack; // ✅ Safest way
          if (subGridInstance?.addWidget) {
            target = subGridInstance;
          } else {
            console.warn(`⚠️ Sub-grid element found but GridStack instance not ready yet.`);
          }
        } else {
          console.warn(`⚠️ Could not find sub-grid element for: ${targetId}. Adding to root.`);
        }
      }

      target.addWidget({ ...widget, id: newId });
    } else {
      console.warn("⚠️ gridStack is null. Skipping gridStack.addWidget.");
    }

    setRawWidgetMetaMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(newId, widget);
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
        gridStack.move(el, { x, y });
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
