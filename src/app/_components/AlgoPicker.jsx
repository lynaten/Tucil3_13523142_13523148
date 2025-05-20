"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import React, { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

const AlgoPicker = ({ solver, setSolver, heuristic, setHeuristic }) => {
	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 px-8 shadow-lg flex flex-col border border-gray-300 ">
			<div className="flex items-center mb-2">
				<Settings className="mr-2" size={18} />
				<h2 className="text-xl font-semibold text-black">Algorithm</h2>
			</div>

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
			<div className="mt-4 text-xs text-gray-500">Heuristic:</div>
			<div>
				<Select value={heuristic} onValueChange={setHeuristic}>
					<SelectTrigger className="w-full bg-white border-gray-300 hover:border-blue-500 transition-colors focus:ring-blue-200">
						<SelectValue placeholder="Select a heuristic" />
					</SelectTrigger>
					<SelectContent className="bg-white border-gray-200">
						<SelectItem
							value="distance"
							className="hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"
						>
							Distance
						</SelectItem>
						<SelectItem
							value="blocker"
							className="hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"
						>
							Blocker Count
						</SelectItem>
						<SelectItem
							value="composite"
							className="hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700"
						>
							Composite (Blocker + Distance)
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="mt-4 text-xs text-gray-500">
				Selected:{" "}
				{solver === "ucs"
					? "Uniformed Cost Search (UCS)"
					: solver === "greedy"
					? "Greedy Best First Search (GBFS)"
					: solver === "astar"
					? "A* Search"
					: ""}{" "}
				{heuristic && ` - ${heuristic} heuristic`}
			</div>
		</div>
	);
};

export default AlgoPicker;
