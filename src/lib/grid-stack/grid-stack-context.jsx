import { createContext, useContext } from "react";

// Optional: If you're using VS Code or a similar editor, JSDoc comments help with IntelliSense
/**
 * @typedef {Object} GridStackContextType
 * @property {object} initialOptions
 * @property {object|null} gridStack
 * @property {(fn: (id: string) => object) => void} addWidget
 * @property {(id: string) => void} removeWidget
 * @property {(id: string, x: number, y: number) => void} moveWidget
 * @property {(fn: (id: string, withWidget: (w: object) => object) => object) => void} addSubGrid
 * @property {() => object|object[]|undefined} saveOptions
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
