// src/bots/botEngine.js

/**
 * BOT ENGINE
 * Handles bot simulation, move choices, and difficulty modes.
 */

export function createBotEngine({ 
  size,
  difficulty = "easy",
  onBotMove,        // callback(botTiles)
  onBotSolved,      // callback()
}) {
  // ---------- INITIAL BOT BOARD ----------
  const goal = [...Array(size * size).keys()].map(n => n + 1);
  goal[goal.length - 1] = 0;

  // bot board is a COPY of goal, then shuffled a few times
  let botBoard = shuffleBoard(goal, size, difficulty);

  function shuffleBoard(board, size, diff) {
    let copy = [...board];

    // small shuffle for easy, larger for harder
    const shuffleCount = diff === "easy" ? 5 :
                         diff === "moderate" ? 20 :
                         diff === "hard" ? 50 : 30;

    for (let i = 0; i < shuffleCount; i++) {
      const blank = copy.indexOf(0);
      const moves = getNeighbors(blank, size);
      const pick = moves[Math.floor(Math.random() * moves.length)];
      [copy[blank], copy[pick]] = [copy[pick], copy[blank]];
    }
    return copy;
  }

  // ---------- MOVE HELPERS ----------
  function getNeighbors(i, size) {
    const r = Math.floor(i / size);
    const c = i % size;
    const neighbors = [];

    if (r > 0) neighbors.push(i - size);
    if (r < size - 1) neighbors.push(i + size);
    if (c > 0) neighbors.push(i - 1);
    if (c < size - 1) neighbors.push(i + 1);

    return neighbors;
  }

  function isSolved(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[arr.length - 1] === 0;
  }

  // ---------- BOT MOVE SPEED ----------
  const speed = {
    easy: 900,
    moderate: 550,
    hard: 250,
    adaptive: 400, // adjusts over time later
  }[difficulty];

  let intervalId = null;

  // ---------- BOT LOOP ----------
  function start() {
    intervalId = setInterval(() => {
      // choose a move
      const blank = botBoard.indexOf(0);
      const moves = getNeighbors(blank, size);

      let choice;
      if (difficulty === "easy") {
        // random move
        choice = moves[Math.floor(Math.random() * moves.length)];

      } else if (difficulty === "moderate") {
        // prefers moves that place a tile closer to correct position
        choice = pickSmartMove(botBoard, moves, size, 0.5);

      } else if (difficulty === "hard" || difficulty === "adaptive") {
        choice = pickSmartMove(botBoard, moves, size, 1.0);
      }

      // apply move
      const next = [...botBoard];
      [next[blank], next[choice]] = [next[choice], next[blank]];
      botBoard = next;

      onBotMove(botBoard);

      if (isSolved(botBoard)) {
        clearInterval(intervalId);
        onBotSolved();
      }
    }, speed);
  }

  function pickSmartMove(board, moves, size, intelligence) {
    /**
     * intelligence 0.5 = kinda smart
     * intelligence 1.0 = always best local move
     */

    const scores = moves.map(m => {
      const tile = board[m];
      if (tile === 0) return -999;

      const goalIndex = tile - 1;
      const correctRow = Math.floor(goalIndex / size);
      const correctCol = goalIndex % size;

      const curRow = Math.floor(m / size);
      const curCol = m % size;

      const dist = Math.abs(correctRow - curRow) + Math.abs(correctCol - curCol);

      return -dist; // lower distance = better score
    });

    if (Math.random() > intelligence) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestIndex = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[bestIndex]) bestIndex = i;
    }

    return moves[bestIndex];
  }

  function stop() {
    clearInterval(intervalId);
  }

  return {
    start,
    stop,
    getState: () => botBoard,
  };
}
