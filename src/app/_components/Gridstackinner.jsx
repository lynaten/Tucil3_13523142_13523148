import React from "react";
import { GridStackRenderProvider } from "@/lib/grid-stack-render-provider";
import { GridStackRender } from "@/lib/grid-stack-render";
import { COMPONENT_MAP } from "@/lib/component-map";

const GridstackInner = () => {
  return (
    <GridStackRenderProvider>
      <GridStackRender componentMap={COMPONENT_MAP} />
    </GridStackRenderProvider>
  );
};

export default GridstackInner;
