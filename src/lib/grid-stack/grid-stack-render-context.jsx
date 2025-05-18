import { createContext, useContext } from "react";

/**
 * @typedef {Object} GridStackRenderContextType
 * @property {(widgetId: string) => HTMLElement | null} getWidgetContainer
 * @property {(widgetId: string) => boolean} hasWidget
 */

/** @type {import("react").Context<GridStackRenderContextType | null>} */
export const GridStackRenderContext = createContext(null);

export function useGridStackRenderContext() {
	const context = useContext(GridStackRenderContext);
	if (!context) {
		throw new Error(
			"useGridStackRenderContext must be used within a GridStackProvider"
		);
	}
	return context;
}
