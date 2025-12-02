// src/bots/botEngine.js

// Helper: convert index <-> row/col
function indexToRC(index, size) {
  return { r: Math.floor(index / size), c: index % size };
}

function neighborsOfBlank(board, size) {
  const blank = board.indexOf(0);
  const { r, c } = indexToRC(blank, size);

  const deltas = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 },  // right
  ];

  const result = [];
  for (const { dr, dc } of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    result.push(nr * size + nc);
  }
  return result;
}

// BFS to find the optimal FIRST move from this board
function getBestMove(board, size) {
  const goal = [];
  for (let i = 1; i < size * size; i++) goal.push(i);
  goal.push(0);
  const goalKey = goal.join(",");
  const startKey = board.join(",");

  if (startKey === goalKey) return null;

  const queue = [board];
  const visited = new Set([startKey]);
  const parents = new Map(); // childKey -> { parentKey, moveIndex }

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = current.join(",");

    if (currentKey === goalKey) {
      // Reconstruct path of move indices from start -> goal
      const path = [];
      let k = goalKey;
      while (k !== startKey) {
        const info = parents.get(k);
        if (!info) break;
        path.push(info.moveIndex); // tile index that was clicked in parent
        k = info.parentKey;
      }
      path.reverse();
      return path.length > 0 ? path[0] : null;
    }

    const blankNeighbors = neighborsOfBlank(current, size);
    const blankIdx = current.indexOf(0);

    for (const moveIdx of blankNeighbors) {
      const next = [...current];
      [next[blankIdx], next[moveIdx]] = [next[moveIdx], next[blankIdx]];
      const key = next.join(",");
      if (visited.has(key)) continue;
      visited.add(key);
      parents.set(key, { parentKey: currentKey, moveIndex: moveIdx });
      queue.push(next);
    }
  }

  // Shouldn't happen for a solvable board, but just in case:
  return null;
}

// Difficulty configuration
const DIFF_CONFIG = {
  easy: {
    baseDelay: 1150,
    pauseProb: 0.30,
    mistakeProb: 0.35,
  },
  medium: {
    baseDelay: 800,
    pauseProb: 0.12,
    mistakeProb: 0.22,
  },
  hard: {
    baseDelay: 450,
    pauseProb: 0.03,
    mistakeProb: 0.06,
  },
  adaptive: {
    baseDelay: 800,
    pauseProb: 0.18,
    mistakeProb: 0.25,
  },
};

export function getBotBaseDelay(difficulty) {
  const key = (difficulty || "medium").toLowerCase();
  const cfg = DIFF_CONFIG[key] || DIFF_CONFIG.medium;
  return cfg.baseDelay;
}

/**
 * Decide what the bot should do THIS step.
 *
 * @param {number[]} board - current bot board
 * @param {number} size    - grid size (3 for now)
 * @param {string} difficulty - "easy" | "medium" | "hard" | "adaptive"
 * @param {number|null} prevMoveIndex - tile index bot moved last time
 *
 * Returns:
 *  { type: "pause" }
 *  or
 *  { type: "move", index: number, quality: "best" | "mistake" }
 *  or
 *  { type: "done" }   // already solved
 */
export function getBotDecision(board, size, difficulty, prevMoveIndex = null) {
  const diffKey = (difficulty || "medium").toLowerCase();
  const cfg = DIFF_CONFIG[diffKey] || DIFF_CONFIG.medium;

  // Already solved?
  const goal = [];
  for (let i = 1; i < size * size; i++) goal.push(i);
  goal.push(0);
  const isSolved = board.every((v, i) => v === goal[i]);
  if (isSolved) {
    return { type: "done" };
  }

  const bestMove = getBestMove(board, size);
  if (bestMove == null) {
    return { type: "pause" }; // fail-safe
  }

  const neighbors = neighborsOfBlank(board, size);
  const mistakeChoices = neighbors.filter(
    (idx) => idx !== bestMove && idx !== prevMoveIndex
  );

  const r = Math.random();

  // 1) pause (no move, just "thinking")
  if (r < cfg.pauseProb) {
    return { type: "pause" };
  }

  // 2) intentional mistake (wrong legal move)
  if (r < cfg.pauseProb + cfg.mistakeProb && mistakeChoices.length > 0) {
    const mIdx = mistakeChoices[Math.floor(Math.random() * mistakeChoices.length)];
    return { type: "move", index: mIdx, quality: "mistake" };
  }

  // 3) optimal move
  return { type: "move", index: bestMove, quality: "best" };
}
