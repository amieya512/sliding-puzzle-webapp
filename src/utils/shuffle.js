// src/utils/shuffle.js
function makeGoalBoard(size) {
  const tiles = [];
  for (let i = 1; i < size * size; i++) tiles.push(i);
  tiles.push(0);
  return tiles;
}

function countInversions(arr) {
  const nums = arr.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inv++;
    }
  }
  return inv;
}

function isSolvableInternal(tiles, size) {
  const inv = countInversions(tiles);

  if (size % 2 === 1) {
    return inv % 2 === 0;
  }

  const blankIndex = tiles.indexOf(0);
  const blankRowFromBottom = size - Math.floor(blankIndex / size);

  if (blankRowFromBottom % 2 === 0) {
    return inv % 2 === 1;
  }
  return inv % 2 === 0;
}

export function boardToLayoutId(tiles) {
  return tiles.join("-");
}

export function isSolved(tiles) {
  const size = Math.sqrt(tiles.length);
  const goal = makeGoalBoard(size);
  return tiles.every((v, i) => v === goal[i]);
}

export function newSolvableBoard(size, playedLayoutsForSize = new Set()) {
  const base = makeGoalBoard(size);
  let tiles = [...base];

  let safety = 0;
  while (true) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    const layoutId = boardToLayoutId(tiles);

    if (isSolvableInternal(tiles, size) && !playedLayoutsForSize.has(layoutId)) {
      return tiles;
    }

    safety++;
    if (safety > 10000) {
      return base;
    }
  }
}
