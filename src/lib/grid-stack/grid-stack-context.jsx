import { createContext, useContext } from "react";

/**
 * @typedef {Object} GridStackContextType
 * @property {object} initialOptions
 * @property {object|null} gridStack
 * @property {(fn: (id: string) => object, targetId?: string) => void} addWidget
 * @property {(id: string) => void} removeWidget
 * @property {(id: string, x?: number, y?: number) => void} moveWidget
 * @property {(fn: (subGridId: string, withWidget: (w: object) => object) => object) => void} addSubGrid
 * @property {() => object|object[]|undefined} saveOptions
 * @property {(id: string, size?: {x?: number, y?: number, w?: number, h?: number}) => void} resizeWidget
 * @property {(opts?: {cols?: number, rowH?: import("gridstack").numberOrString, targetId?: string}) => void} resizeGrid
 * @property {{ value: object|null, set: Function }} _gridStack
 * @property {{ value: Map<string, object>, set: Function }} _rawWidgetMetaMap
 */

/** @type {import('react').Context<GridStackContextType|null>} */
export const GridStackContext = createContext(null);

export function useGridStackContext() {
  const context = useContext(GridStackContext);
  if (!context) {
    throw new Error(
      "useGridStackContext must be used within a GridStackProvider"
    );
  }
  return context;
}
