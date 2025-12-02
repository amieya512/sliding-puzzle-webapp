/**
 * BFS solver for 3×3 (8-puzzle) to get optimal solution path.
 * Returns an array of tile indices to click in sequence to solve the puzzle.
 * 
 * @param {number[]} startTiles - The starting board state
 * @param {number} size - The board size (currently only supports 3)
 * @returns {number[]} Array of tile indices to click in order
 */
export function computeBotMoves(startTiles, size = 3) {
  if (size !== 3) {
    // Only support 3×3 for now
    return [];
  }

  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const goalKey = goal.join(",");

  const startKey = startTiles.join(",");
  if (startKey === goalKey) return [];

  function indexToRC(index) {
    return { r: Math.floor(index / size), c: index % size };
  }

  const queue = [startTiles];
  const visited = new Set([startKey]);
  const parents = new Map(); // key -> { parentKey, board }

  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 }, // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 }, // right
  ];

  function getNeighborsBoards(board) {
    const neighbors = [];
    const blankIdx = board.indexOf(0);
    const { r, c } = indexToRC(blankIdx);

    for (const { dr, dc } of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const neighborIdx = nr * size + nc;

      const next = [...board];
      [next[blankIdx], next[neighborIdx]] = [next[neighborIdx], next[blankIdx]];
      neighbors.push(next);
    }

    return neighbors;
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = current.join(",");

    if (currentKey === goalKey) {
      // Reconstruct path from start -> goal
      const pathBoards = [];
      let k = currentKey;
      while (k !== startKey) {
        const parentInfo = parents.get(k);
        if (!parentInfo) break;
        pathBoards.push(parentInfo.board);
        k = parentInfo.parentKey;
      }
      pathBoards.reverse();

      // Convert board path into "tile index to click" sequence
      const moves = [];
      let cur = startTiles;
      for (const nextBoard of pathBoards) {
        const blankNextIdx = nextBoard.indexOf(0);
        // The tile to click in current board is where the blank will move to
        moves.push(blankNextIdx);
        cur = nextBoard;
      }
      return moves;
    }

    for (const neighbor of getNeighborsBoards(current)) {
      const key = neighbor.join(",");
      if (visited.has(key)) continue;
      visited.add(key);
      parents.set(key, { parentKey: currentKey, board: neighbor });
      queue.push(neighbor);
    }
  }

  // Fallback: no solution found (shouldn't happen for a solvable board)
  return [];
}

