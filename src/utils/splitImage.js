// src/utils/splitImage.js

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function splitImageIntoTiles(imageUrl, size) {
  const img = await loadImage(imageUrl);

  const side = Math.min(img.width, img.height);
  const offsetX = (img.width - side) / 2;
  const offsetY = (img.height - side) / 2;

  const rawTileSize = side / size;
  const tileSize = Math.floor(rawTileSize);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = tileSize;
  canvas.height = tileSize;

  const tiles = [];
  tiles[0] = null; // blank tile goes at index 0

  let tileNumber = 1;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {

      // ⛔ FIXED: Do NOT use break — only skip the very last tile.
      if (row === size - 1 && col === size - 1) continue;

      const sx = offsetX + col * rawTileSize;
      const sy = offsetY + row * rawTileSize;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        sx,
        sy,
        rawTileSize,
        rawTileSize,
        0,
        0,
        canvas.width,
        canvas.height
      );

      tiles[tileNumber] = canvas.toDataURL("image/jpeg", 0.9);
      tileNumber++;
    }
  }

  // return array indexed 0..(n*n - 1)
  return tiles;
}
