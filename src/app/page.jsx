"use client";
import { useState } from "react";
import { GridStackComponent } from "./_components/Gridstack";

export default function GridDemoPage() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/solve", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("✅ File uploaded and processed!");
    } else {
      alert("❌ Failed to process file.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input file-input-bordered file-input-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-1 text-white rounded-md"
        >
          Upload and Solve
        </button>
      </form>

      <div className="w-fit bg-cover bg-center">
        <GridStackComponent key="grid-2" />
      </div>
    </div>
  );
}
