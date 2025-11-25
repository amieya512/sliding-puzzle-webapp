// src/components/Tile.jsx
import React from "react";

export default function Tile({
  value,
  index,
  onClick,
  className = "",
  imageTiles = null,
  isHint = false,
}) {
  const isBlank = value === 0;
  const hasImage = !isBlank && imageTiles && imageTiles[value];

  const backgroundStyle = hasImage
    ? {
        backgroundImage: `url(${imageTiles[value]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <button
      onClick={() => onClick(index)}
      className={`relative flex items-center justify-center text-xl ${
        isBlank ? "" : "font-bold"
      } ${className} ${isHint ? "ring-4 ring-yellow-400" : ""}`}
      style={{
        ...backgroundStyle,
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {hasImage && (
        <span className="absolute inset-0 bg-black/25 pointer-events-none" />
      )}

      {!isBlank && (
        <span className="relative z-10 text-white select-none">
          {value}
        </span>
      )}
    </button>
  );
}