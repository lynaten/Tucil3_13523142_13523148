import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useGridStackContext } from "./grid-stack-context";
import { GridStack } from "gridstack";
import { GridStackRenderContext } from "./grid-stack-render-context";
import isEqual from "react-fast-compare";

export function GridStackRenderProvider({ children }) {
	const {
		_gridStack: { value: gridStack, set: setGridStack },
		initialOptions,
	} = useGridStackContext();

	const widgetContainersRef = useRef(new Map());
	const containerRef = useRef(null);
	const optionsRef = useRef(initialOptions);

	const renderCBFn = useCallback((element, widget) => {
		if (widget.id) {
			widgetContainersRef.current.set(widget.id, element);
		}
	}, []);

	const initGrid = useCallback(() => {
		if (containerRef.current) {
			GridStack.renderCB = renderCBFn;
			return GridStack.init(optionsRef.current, containerRef.current);
		}
		return null;
	}, [renderCBFn]);

	useLayoutEffect(() => {
		if (!isEqual(initialOptions, optionsRef.current) && gridStack) {
			try {
				gridStack.removeAll(false);
				gridStack.destroy(false);
				widgetContainersRef.current.clear();
				optionsRef.current = initialOptions;
				setGridStack(initGrid());
			} catch (e) {
				console.error("Error reinitializing gridstack", e);
			}
		}
	}, [initialOptions, gridStack, initGrid, setGridStack]);

	useLayoutEffect(() => {
		if (!gridStack) {
			try {
				setGridStack(initGrid());
			} catch (e) {
				console.error("Error initializing gridstack", e);
			}
		}
	}, [gridStack, initGrid, setGridStack]);

	return (
		<GridStackRenderContext.Provider
			value={useMemo(
				() => ({
					getWidgetContainer: (widgetId) =>
						widgetContainersRef.current.get(widgetId) || null,
					hasWidget: (widgetId) =>
						widgetContainersRef.current.has(widgetId),
				}),
				[gridStack]
			)}
		>
			<div ref={containerRef}>{gridStack ? children : null}</div>
		</GridStackRenderContext.Provider>
	);
}
