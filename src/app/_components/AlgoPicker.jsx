"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import React, { useState } from "react";

const AlgoPicker = ({ solver, setSolver }) => {
	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 px-8 shadow-lg flex flex-col border border-gray-300  flex-1">
			<h2 className="text-xl font-semibold mb-2 text-black">Algorithm</h2>
			<p className="text-gray-500 text-sm">
				Select between UCS, GBFS, and A* search
			</p>
			<div className="flex items-center justify-center">
				<ToggleGroup
					type="single"
					className="mt-4 cursor-pointer shadow-md flex items-center justify-center rounded-md flex-1 overflow-auto"
					value={solver}
					onValueChange={(value) => {
						if (value) {
							setSolver(value);
						}
					}}
				>
					<ToggleGroupItem value="ucs" className="px-4">
						UCS
					</ToggleGroupItem>
					<ToggleGroupItem value="greedy" className="px-4">
						GBFS
					</ToggleGroupItem>
					<ToggleGroupItem value="astar" className="px-12">
						A*
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<div className="mt-4 text-xs text-gray-500">
				Selected:{" "}
				{solver === "ucs"
					? "Uniformed Cost Search (UCS)"
					: solver === "greedy"
					? "Greedy Best First Search (GBFS)"
					: solver === "astar"
					? "A* Search"
					: ""}
			</div>
		</div>
	);
};

export default AlgoPicker;
