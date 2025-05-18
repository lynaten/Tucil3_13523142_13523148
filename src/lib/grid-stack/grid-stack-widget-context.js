import { createContext, useContext } from "react";

/**
 * @typedef {{ id: string }} WidgetMeta
 */

/** @type {import("react").Context<{ widget: WidgetMeta } | null>} */
export const GridStackWidgetContext = createContext(null);

export function useGridStackWidgetContext() {
	const context = useContext(GridStackWidgetContext);
	if (!context) {
		throw new Error(
			"useGridStackWidgetContext must be used within a GridStackWidgetProvider"
		);
	}
	return context;
}
