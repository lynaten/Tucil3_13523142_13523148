import React from "react";
import GridDemoPage from "./_components/GridDemoPage";
import AlgoPicker from "./_components/AlgoPicker";
import { GridStackProvider } from "@/lib/grid-stack/grid-stack-provider";

const notes = {
	title: "Notes:",
	content: [
		{
			text: "Untuk input secara graphical, bisa drag dan resize grid maupun piece secara flexible, namun setiap kali resize dia bakal reset piece nya, jadi set board dengan resize sebelum menaruh vehicle",
		},
		{
			text: "Untuk ubah row, bisa dilakukan dengan meresize grid kebawah",
		},
		{
			text: "Add obstacle/vehicle akan menambah kebawah dan jika mentok ke row terakhir, perlu dipindahkan terlebih dahulu sebelum add lagi atau tidak akan keregister piece nya",
		},
	],
};

const page = () => {
	return (
		<div className="min-h-screen w-full scale-90 ">
			Liat notes dibawah Kak 🙏
			<div>
				<GridDemoPage />
			</div>
			<div className="w-1/4">
				<div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sticky top-6">
					<div className="flex items-center mb-3">
						<h3 className="text-md font-semibold text-gray-800">
							{notes.title}
						</h3>
					</div>

					<div className="space-y-3">
						{notes.content.map((item, index) => (
							<div
								key={index}
								className="border-l-3 border-black/80 pl-3"
							>
								<p className="text-xs text-gray-600 leading-relaxed">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default page;
