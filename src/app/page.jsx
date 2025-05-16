"use client";
import { GridStackComponent } from "./_components/Gridstack";

export const BASE_GRID_OPTIONS = {
  removable: false,
  acceptWidgets: true,
  float: true,
  itemClass: "grid-stack-item",
  margin: 8,
  cellHeight: 60,
  column: 6,
  minRow: 6, 
  maxRow: 6, 
  disableResize: false, 
  disableDrag: false, 
};


export default function GridDemoPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-96 bg-cover bg-center">
        <GridStackComponent key="grid-2" initialOptions={BASE_GRID_OPTIONS} />
      </div>
    </div>
  );
}
