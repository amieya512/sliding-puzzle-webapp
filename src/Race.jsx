// src/Race.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tile from "./components/Tile";
import Timer from "./components/Timer";
import {
  newSolvableBoard,
  isSolved as checkSolved,
} from "./utils/shuffle";

export default function Race() {
  const navigate = useNavigate();
  const location = useLocation();

  // Coming from RaceBotModal
  const {
    botName = "Bot",
    botAvatar = null,
    difficulty: rawDifficulty = "Easy",
    size: initialSize = 3,
  } = location.state || {};

  const size = initialSize || 3; // We’ll keep race at 3×3 for now

  const [playerTiles, setPlayerTiles] = useState([]);
  const [botTiles, setBotTiles] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);

  const [playerMoves, setPlayerMoves] = useState(0);
  const [botMovesCount, setBotMovesCount] = useState(0);

  const [playerSeconds, setPlayerSeconds] = useState(0);
  const [botSeconds, setBotSeconds] = useState(0);

  const [playerRunning, setPlayerRunning] = useState(true);
  const [botRunning, setBotRunning] = useState(true);

  const [botMoveSequence, setBotMoveSequence] = useState([]);
  const [winner, setWinner] = useState(null); // "player" | "bot" | "tie"
  const [raceOver, setRaceOver] = useState(false);

  const botTimerRef = useRef(null);
  const raceOverRef = useRef(false);

  const difficulty = (rawDifficulty || "Easy").toLowerCase();

  // --- Helpers for neighbor checks (same logic as Puzzle) ---
  function indexToRC(index) {
    return { r: Math.floor(index / size), c: index % size };
  }

  function areNeighbors(i, j) {
    const a = indexToRC(i);
    const b = indexToRC(j);
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  // --- BFS solver for 3×3 (8-puzzle) to get optimal solution path ---
  function computeBotMoves(startTiles) {
    if (size !== 3) {
      // Only support 3×3 for now
      return [];
    }

    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const goalKey = goal.join(",");

    const startKey = startTiles.join(",");
    if (startKey === goalKey) return [];

    const queue = [startTiles];
    const visited = new Set([startKey]);
    const parents = new Map(); // key -> { parentKey, board }

    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 },  // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 },  // right
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

    // Fallback: no solution found (shouldn’t happen for a solvable board)
    return [];
  }

  // --- Initialize race: same board for player & bot ---
  useEffect(() => {
    // If someone navigates directly to /race with no state, send them back
    if (!location.state) {
      navigate("/dashboard");
      return;
    }

    const board = newSolvableBoard(size);
    setInitialBoard(board);
    setPlayerTiles(board);
    setBotTiles(board);

    // Pre-compute bot move sequence from BFS
    const moves = computeBotMoves(board);
    setBotMoveSequence(moves);

    // Reset race state
    setPlayerMoves(0);
    setBotMovesCount(0);
    setPlayerSeconds(0);
    setBotSeconds(0);
    setPlayerRunning(true);
    setBotRunning(true);
    setWinner(null);
    raceOverRef.current = false;
    setRaceOver(false);
  }, [size, navigate, location.state]);

  // --- Bot auto-move effect ---
  useEffect(() => {
    if (!botMoveSequence.length) return;
    if (raceOverRef.current) return;

    const speedMap = {
      easy: 900,
      medium: 600,
      hard: 350,
      adaptive: 600,
    };
    const delay = speedMap[difficulty] || 700;

    let i = 0;
    let cancelled = false;

    function step() {
      if (cancelled || raceOverRef.current) return;
      if (i >= botMoveSequence.length) {
        // Bot completed its planned path
        if (!raceOverRef.current && checkSolved(botTiles)) {
          raceOverRef.current = true;
          setRaceOver(true);
          setWinner((w) => w || "bot");
          setBotRunning(false);
          setPlayerRunning(false);
        }
        return;
      }

      const moveIdx = botMoveSequence[i];

      setBotTiles((prev) => {
        const blankIdx = prev.indexOf(0);
        if (!areNeighbors(moveIdx, blankIdx)) return prev;

        const next = [...prev];
        [next[moveIdx], next[blankIdx]] = [next[blankIdx], next[moveIdx]];

        // If bot solves here and player hasn't, bot wins
        if (checkSolved(next) && !raceOverRef.current) {
          raceOverRef.current = true;
          setRaceOver(true);
          setWinner("bot");
          setBotRunning(false);
          setPlayerRunning(false);
        }

        return next;
      });

      setBotMovesCount((c) => c + 1);
      i += 1;

      if (!raceOverRef.current && i < botMoveSequence.length) {
        botTimerRef.current = setTimeout(step, delay);
      }
    }

    botTimerRef.current = setTimeout(step, delay);

    return () => {
      cancelled = true;
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
  }, [botMoveSequence, difficulty, botTiles]);

  // --- Player move handler ---
  function handlePlayerMove(idx) {
    if (raceOverRef.current) return;

    const blank = playerTiles.indexOf(0);
    if (!areNeighbors(idx, blank)) return;

    const next = [...playerTiles];
    [next[idx], next[blank]] = [next[blank], next[idx]];

    setPlayerTiles(next);
    setPlayerMoves((m) => m + 1);

    if (checkSolved(next) && !raceOverRef.current) {
      raceOverRef.current = true;
      setRaceOver(true);
      setWinner("player");
      setPlayerRunning(false);
      setBotRunning(false);
    }
  }

  // --- Display helpers ---
  const baseTileSize = 90; // Race boards are fixed 3×3 for now

  const fmt = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!playerTiles.length || !botTiles.length) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center pt-8">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">
        Race a Bot
      </h1>

      {/* Bot header */}
      <div className="flex items-center gap-4 mb-6">
        {botAvatar && (
          <img
            src={botAvatar}
            alt={botName}
            className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 object-contain"
          />
        )}
        <div className="text-left">
          <p className="text-lg font-semibold">{botName}</p>
          <p className="text-sm text-gray-300 capitalize">
            Difficulty: {difficulty}
          </p>
        </div>
      </div>

      {/* Boards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        {/* Player side */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-1 text-green-400">
            You
          </h2>
          <Timer
            autoStart
            running={playerRunning}
            resetTrigger={false}
            onTick={setPlayerSeconds}
          />
          <div
            className="grid gap-1 mt-3 border border-gray-700 bg-gray-800 p-4 rounded-lg shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(${baseTileSize}px, ${baseTileSize}px))`,
            }}
          >
            {playerTiles.map((v, i) => (
              <Tile
                key={i}
                value={v}
                index={i}
                onClick={handlePlayerMove}
                className={`${
                  v === 0
                    ? "bg-transparent"
                    : "bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Moves: {playerMoves} • Time: {fmt(playerSeconds)}
          </p>
        </div>

        {/* Bot side */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-1 text-purple-400">
            {botName}
          </h2>
          <Timer
            autoStart
            running={botRunning}
            resetTrigger={false}
            onTick={setBotSeconds}
          />
          <div
            className="grid gap-1 mt-3 border border-gray-700 bg-gray-800 p-4 rounded-lg shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(${baseTileSize}px, ${baseTileSize}px))`,
            }}
          >
            {botTiles.map((v, i) => (
              <Tile
                key={i}
                value={v}
                index={i}
                // Bot tiles not clickable
                onClick={() => {}}
                className={`${
                  v === 0
                    ? "bg-transparent"
                    : "bg-gray-700 text-white font-semibold rounded"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Moves: {botMovesCount} • Time: {fmt(botSeconds)}
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="mt-8 flex gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-gray-800"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            // simple rematch: re-run same effect by navigating back to race with same state
            navigate("/race", {
              state: {
                botName,
                botAvatar,
                difficulty: rawDifficulty,
                size,
              },
            });
          }}
          className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-yellow-700"
        >
          Rematch
        </button>
      </div>

      {/* Winner overlay */}
      {raceOver && winner && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[360px] text-center shadow-xl">
            {winner === "player" && (
              <h2 className="text-2xl font-bold text-green-400 mb-3">
                You win! 🎉
              </h2>
            )}
            {winner === "bot" && (
              <h2 className="text-2xl font-bold text-red-400 mb-3">
                {botName} wins!
              </h2>
            )}
            {winner === "tie" && (
              <h2 className="text-2xl font-bold text-yellow-300 mb-3">
                It&apos;s a tie!
              </h2>
            )}

            <p className="text-sm text-gray-200 mb-4">
              Your time: <span className="font-mono">{fmt(playerSeconds)}</span>{" "}
              • {botName}&apos;s time:{" "}
              <span className="font-mono">{fmt(botSeconds)}</span>
            </p>

            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={() =>
                  navigate("/race", {
                    state: {
                      botName,
                      botAvatar,
                      difficulty: rawDifficulty,
                      size,
                    },
                  })
                }
                className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-blue-700"
              >
                Race Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-gray-800"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
