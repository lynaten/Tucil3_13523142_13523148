import { createPortal } from "react-dom";
import { useGridStackContext } from "./grid-stack-context";
import { useGridStackRenderContext } from "./grid-stack-render-context";
import { GridStackWidgetContext } from "./grid-stack-widget-context";

/**
 * Parses the content of a GridStackWidget into a component name and props.
 * @param {object} meta
 * @returns {{ name: string, props: object, error: unknown }}
 */
function parseWeightMetaToComponentData(meta) {
  let error = null;
  let name = "";
  let props = {};

  console.group(
    `🧩 Parsing meta.content for widget ID: ${meta.id ?? "(no id)"}`
  );
  console.log("📜 Raw content:", meta.content);

  try {
    if (meta.content) {
      const result = JSON.parse(meta.content);
      name = result.name;
      props = result.props;

      console.log("✅ Parsed name:", name);
      console.log("✅ Parsed props:", props);
    } else {
      console.warn("⚠️ No content provided in widget meta.");
    }
  } catch (e) {
    error = e;
    console.error("❌ Failed to parse meta.content:", e);
  }

  console.groupEnd();

  return {
    name,
    props,
    error,
  };
}

/**
 * @param {{ componentMap: { [key: string]: React.ComponentType<any> } }} props
 */
export function GridStackRender({ componentMap }) {
  const { _rawWidgetMetaMap } = useGridStackContext();
  const { getWidgetContainer, hasWidget } = useGridStackRenderContext();

  console.log("📦 componentMap contents:");
  Object.entries(componentMap).forEach(([key, value]) => {
    console.log(`- ${key}:`, value?.name ?? value);
  });

  const entries = Array.from(_rawWidgetMetaMap.value.entries());

  console.log("🔍 Rendering GridStack Widgets. Total:", entries.length);

  return (
    <>
      {entries.map(([id, meta]) => {
        const { name, props } = parseWeightMetaToComponentData(meta);
        const WidgetComponent = componentMap[name];

        console.log(`🧱 [${id}] Component requested: "${name}"`);

        if (!hasWidget(id)) {
          console.warn(
            `❌ Widget "${id}" not registered in this GridStack instance`
          );
        }

        if (!WidgetComponent) {
          console.warn(
            `❌ Component "${name}" not found in componentMap. Skipping widget id: ${id}`
          );
          return null;
        }

        const container = getWidgetContainer(id);
        if (!container) {
          console.error(`❌ No DOM container found for widget id: ${id}`);
          return null;
        }

        console.log(`✅ Rendering "${name}" into container for id: ${id}`);

        return (
          <GridStackWidgetContext.Provider key={id} value={{ widget: { id } }}>
            {createPortal(<WidgetComponent {...props} />, container)}
          </GridStackWidgetContext.Provider>
        );
      })}
    </>
  );
}
