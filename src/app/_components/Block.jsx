import React from "react";

const Block = ({
  color = "bg-red-400",
  text = "",
  textColor = "text-white",
  fontSize = "text-base",
  centered = true,
}) => {
  return (
    <div
      className={`h-full w-full ${color} ${
        centered ? "flex items-center justify-center text-center" : ""
      }`}
    >
      <span className={`${textColor} ${fontSize}`}>{text}</span>
    </div>
  );
};

export default Block;