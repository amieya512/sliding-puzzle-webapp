// src/utils/shuffle.js

export function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  export function countInversions(tiles) {
    const seq = tiles.filter((v) => v !== 0);
    let inv = 0;
    for (let i = 0; i < seq.length; i++) {
      for (let j = i + 1; j < seq.length; j++) {
        if (seq[i] > seq[j]) inv++;
      }
    }
    return inv;
  }
  
  export function blankRowFromBottom(tiles, size) {
    const idx = tiles.indexOf(0);
    const rowFromTop = Math.floor(idx / size) + 1;
    return size - rowFromTop + 1;
  }
  
  export function isSolvable(tiles, size) {
    const inv = countInversions(tiles);
    if (size % 2 === 1) {
      return inv % 2 === 0;
    }
    const blankFromBottom = blankRowFromBottom(tiles, size);
    const invEven = inv % 2 === 0;
    const blankEven = blankFromBottom % 2 === 0;
    return (blankEven && !invEven) || (!blankEven && invEven);
  }
  
  export function isSolved(tiles) {
    const n = tiles.length;
    for (let i = 0; i < n - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[n - 1] === 0;
  }
  
  export function newSolvableBoard(size) {
    const goal = Array.from({ length: size * size }, (_, i) =>
      i === size * size - 1 ? 0 : i + 1
    );
    let tiles;
    do {
      tiles = shuffleArray(goal);
    } while (!isSolvable(tiles, size) || isSolved(tiles));
    return tiles;
  }
  