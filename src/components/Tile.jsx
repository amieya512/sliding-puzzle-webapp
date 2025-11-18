// src/components/Tile.jsx
import React from "react";

export default function Tile({
  value,
  index,
  onClick,
  className = "",
  imageTiles = null,
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
      } ${className}`}
      style={{
        ...backgroundStyle,
        width: "100%",
        aspectRatio: "1 / 1",  // 💯 PERFECT SQUARE TILE FIX
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
