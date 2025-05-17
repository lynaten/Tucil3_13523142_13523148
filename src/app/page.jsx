"use client";
import { GridStackComponent } from "./_components/Gridstack";



export default function GridDemoPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-fit bg-cover bg-center">
        <GridStackComponent key="grid-2" />
      </div>
    </div>
  );
}
