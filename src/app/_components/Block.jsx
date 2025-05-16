import React from "react";

const Block = ({ color = "bg-red-400", borderRadius }) => {
  return (
    <div className={`h-full w-full ${borderRadius || "rounded-sm"} ${color}`}></div>
  );
};

export default Block;
