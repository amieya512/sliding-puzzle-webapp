// src/utils/getHintMove.js

// Return the index of a good tile to move toward solving,
// avoiding repeating the same hint twice in a row when possible.
export function getHintMove(tiles, size, prevHintIndex = null) {
  const blankIndex = tiles.indexOf(0);
  if (blankIndex === -1) return null;

  const indexToRC = (i) => ({
    r: Math.floor(i / size),
    c: i % size,
  });

  const { r: br, c: bc } = indexToRC(blankIndex);

  // All neighbors of the blank
  const neighbors = [];
  if (br > 0) neighbors.push(blankIndex - size);        // up
  if (br < size - 1) neighbors.push(blankIndex + size); // down
  if (bc > 0) neighbors.push(blankIndex - 1);           // left
  if (bc < size - 1) neighbors.push(blankIndex + 1);    // right

  if (neighbors.length === 0) return null;

  // Prefer neighbors that are NOT the previous hint
  const filteredNeighbors =
    prevHintIndex != null
      ? neighbors.filter((idx) => idx !== prevHintIndex)
      : neighbors.slice();

  const useNeighbors =
    filteredNeighbors.length > 0 ? filteredNeighbors : neighbors;

  // Prefer misplaced tiles in ascending tile number, among useNeighbors
  for (let tileNum = 1; tileNum <= size * size - 1; tileNum++) {
    const currentIndex = tiles.indexOf(tileNum);
    const correctIndex = tileNum - 1;

    if (currentIndex !== correctIndex && useNeighbors.includes(currentIndex)) {
      return currentIndex;
    }
  }

  // Otherwise, just return the first neighbor from our candidate list
  return useNeighbors[0];
}
