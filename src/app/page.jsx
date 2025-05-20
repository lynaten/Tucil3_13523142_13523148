import React from "react";
import GridDemoPage from "./_components/GridDemoPage";
import AlgoPicker from "./_components/AlgoPicker";
import { GridStackProvider } from "@/lib/grid-stack/grid-stack-provider";

const page = () => {
	return (
		<div className="min-h-screen  w-full scale-90 overflow-auto items-center flex">
			<div>
				Boleh liat notes dibawah Kak 🙏
				<GridDemoPage />
			</div>
		</div>
	);
};

export default page;
