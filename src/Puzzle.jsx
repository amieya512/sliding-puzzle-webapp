import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./components/Timer";
import Tile from "./components/Tile";
import {
  isSolved as checkSolved,
  newSolvableBoard,
  boardToLayoutId,
} from "./utils/shuffle";

const GRID_CONFIG = {
  3: { targetTime: 60, cap: 60 },
  4: { targetTime: 180, cap: 50 },
  5: { targetTime: 480, cap: 40 },
};

const GRID_ORDER = [3, 4, 5];

export default function Puzzle({
  initialSize = 3,
  masteredTiers = [],
  onPuzzleComplete,
}) {
  const navigate = useNavigate();

  const [size, setSize] = useState(initialSize);

  const [completedLayouts, setCompletedLayouts] = useState({
    3: new Set(),
    4: new Set(),
    5: new Set(),
  });

  const [tiles, setTiles] = useState(() =>
    newSolvableBoard(initialSize, completedLayouts[initialSize])
  );
  const [layoutId, setLayoutId] = useState(() => boardToLayoutId(tiles));

  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [fastSolveStreak, setFastSolveStreak] = useState(0);
  const [failStreak, setFailStreak] = useState(0);

  useEffect(() => {
    loadNewPuzzle(size);
  }, [size]);

  const solved = useMemo(() => checkSolved(tiles), [tiles]);

  function loadNewPuzzle(s) {
    const completedForSize = completedLayouts[s] ?? new Set();
    const nextBoard = newSolvableBoard(s, completedForSize);
    setTiles(nextBoard);
    setLayoutId(boardToLayoutId(nextBoard));
    setMoves(0);
    setSeconds(0);
  }

  function indexToRC(i, s = size) {
    return { r: Math.floor(i / s), c: i % s };
  }

  function areNeighbors(i, j, s = size) {
    const a = indexToRC(i, s);
    const b = indexToRC(j, s);
    const manhattan = Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
    return manhattan === 1;
  }

  function moveTile(idx) {
    const blank = tiles.indexOf(0);
    if (!areNeighbors(idx, blank)) return;

    const next = [...tiles];
    [next[idx], next[blank]] = [next[blank], next[idx]];
    const nextMoves = moves + 1;

    setTiles(next);
    setMoves(nextMoves);

    const nowSolved = checkSolved(next);

    if (nowSolved) {
      handlePuzzleEnd("win", {
        tiles: next,
        moves: nextMoves,
      });
    }
  }

  function giveUp() {
    handlePuzzleEnd("fail", { tiles, moves });
  }

  function handlePuzzleEnd(result, { tiles, moves }) {
    const cfg = GRID_CONFIG[size];
    const didWin = result === "win";
    const layout = boardToLayoutId(tiles);

    let newCompletedLayouts = completedLayouts;
    if (didWin) {
      const copy = new Set(completedLayouts[size]);
      copy.add(layout);
      newCompletedLayouts = {
        ...completedLayouts,
        [size]: copy,
      };
      setCompletedLayouts(newCompletedLayouts);
    }

    let newFastStreak = fastSolveStreak;
    let newFailStreak = failStreak;

    if (didWin) {
      const fast = seconds <= cfg.targetTime;
      newFastStreak = fast ? fastSolveStreak + 1 : 0;
      newFailStreak = 0;
    } else {
      newFailStreak = failStreak + 1;
      newFastStreak = 0;
    }

    setFastSolveStreak(newFastStreak);
    setFailStreak(newFailStreak);

    const resultData = {
      gridSize: size,
      layoutId: layout,
      time: seconds,
      moves,
      result,
      uniqueLayoutsCompleted: newCompletedLayouts[size]?.size ?? 0,
    };

    if (onPuzzleComplete) {
      onPuzzleComplete(resultData);
    }

    const nextSize = computeNextGridSize({
      size,
      result,
      seconds,
      config: cfg,
      completedCount: newCompletedLayouts[size]?.size ?? 0,
      fastSolveStreak: newFastStreak,
      failStreak: newFailStreak,
      masteredTiers,
    });

    setSize(nextSize);
  }

  function computeNextGridSize({
    size,
    result,
    seconds,
    config,
    completedCount,
    fastSolveStreak,
    failStreak,
    masteredTiers,
  }) {
    const idx = GRID_ORDER.indexOf(size);

    const reachedCap = completedCount >= config.cap;
    const fastWin = result === "win" && seconds <= config.targetTime;
    const eligibleFastSeries = fastWin && fastSolveStreak >= 3;

    if ((reachedCap || eligibleFastSeries) && idx < GRID_ORDER.length - 1) {
      return GRID_ORDER[idx + 1];
    }

    const isMastered = masteredTiers.includes(size);
    if (result === "fail" && failStreak >= 3 && !isMastered && idx > 0) {
      const smallerSize = GRID_ORDER[idx - 1];
      return smallerSize;
    }

    return size;
  }

  function shuffle() {
    loadNewPuzzle(size);
  }

  return (
    <div className="flex flex-col gap-3 items-center">
      <Timer autoStart onTick={setSeconds} />

      <div className="flex gap-2 mt-2">
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setSize(n)}
            className={
              "px-3 py-1 rounded border " +
              (size === n
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-800 border-gray-300")
            }
          >
            {n}×{n}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={shuffle}
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Shuffle
        </button>
        <button
          onClick={() => loadNewPuzzle(size)}
          className="px-3 py-1 rounded bg-gray-600 text-white"
        >
          Reset
        </button>
        <button
          onClick={giveUp}
          className="px-3 py-1 rounded bg-red-600 text-white"
        >
          Give Up
        </button>

        <span className="ml-2 text-sm text-gray-700">Moves: {moves}</span>
        <span className="ml-2 text-sm text-gray-700">
          Grid: {size}×{size}
        </span>

        {solved && (
          <span className="ml-2 text-green-700 font-semibold">Solved!</span>
        )}
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(56px, 64px))`,
        }}
      >
        {tiles.map((v, i) => (
          <Tile key={i} value={v} index={i} onClick={moveTile} />
        ))}
      </div>

      <button
        onClick={() => navigate("/Dashboard")}
        className="bg-green-500 hover:bg-green-700 text-white font-bold px-3 py-3 rounded"
      >
        To Dashboard
      </button>
    </div>
  );
}
