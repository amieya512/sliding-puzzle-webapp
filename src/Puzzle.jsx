// src/Puzzle.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./components/Timer";
import Tile from "./components/Tile";

import {
  isSolved as checkSolved,
  newSolvableBoard,
  boardToLayoutId,
} from "./utils/shuffle";

import {
  loadGameState,
  saveGameState,
  recordSolve,
  recordGiveUp,
  SOLVES_TO_UNLOCK, // for countdown text
} from "./utils/gameState";

import { useAuth } from "./context/AuthContext";

// photo helpers
import { fetchRandomImage } from "./utils/fetchRandomImage";
import { splitImageIntoTiles } from "./utils/splitImage";

// hint helper
import { getHintMove } from "./utils/getHintMove";

export default function Puzzle({ initialSize = 3 }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storageUser = user || null;

  const [gameState, setGameState] = useState(null);

  const [size, setSize] = useState(initialSize);
  const [initialBoard, setInitialBoard] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [layoutId, setLayoutId] = useState(null); // kept for compatibility

  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [running, setRunning] = useState(true);

  const [modal, setModal] = useState(null);

  // photo tiles
  const [tileImages, setTileImages] = useState(null);

  // Hint system
  const [hintIndex, setHintIndex] = useState(null);
  const [hintCount, setHintCount] = useState(0);          // 3 max
  const [previousHintIndex, setPreviousHintIndex] = useState(null);

  // ----------------------------------------------------
  // Load saved game or start a new puzzle
  // ----------------------------------------------------
  useEffect(() => {
    const state = loadGameState(storageUser);
    setGameState(state);

    // resume saved puzzle
    if (state.currentPuzzle) {
      const p = state.currentPuzzle;

      // If puzzle has no images, FORCE a new one
      if (!p.tileImages) {
        generateNewPuzzle(state.currentStage, state);
        return;
      }

      setSize(p.stage);
      setTiles(p.tiles);
      setInitialBoard(p.startTiles);
      setLayoutId(boardToLayoutId(p.startTiles));
      setMoves(p.moves || 0);
      setRunning(true);
      setResetTrigger((x) => !x);
      setTileImages(p.tileImages);

      return;
    }

    // otherwise start new
    generateNewPuzzle(state.currentStage, state);
  }, []);

  // ----------------------------------------------------
  // Save current puzzle state (do NOT overwrite progression)
  // ----------------------------------------------------
  useEffect(() => {
    if (!gameState || tiles.length === 0) return;

    const newState = {
      ...gameState,
      currentPuzzle: {
        stage: size,
        tiles,
        startTiles: initialBoard,
        moves,
        startedAt: gameState.currentPuzzle?.startedAt || Date.now(),
        previewImage: gameState.currentPuzzle?.previewImage || null,
        tileImages: tileImages || gameState.currentPuzzle?.tileImages || null,
      },
    };

    setGameState(newState);
    saveGameState(storageUser, newState);
  }, [tiles, moves, tileImages]);

  // ----------------------------------------------------
  // Generate NEW puzzle + photo tiles
  // ----------------------------------------------------
  async function generateNewPuzzle(stage, baseState = gameState) {
    const board = newSolvableBoard(stage);
    const startLayout = [...board];

    setSize(stage);
    setInitialBoard(startLayout);
    setTiles(board);
    setLayoutId(boardToLayoutId(startLayout));
    setMoves(0);
    setSeconds(0);
    setHintIndex(null);
    setHintCount(0);
    setPreviousHintIndex(null);
    setRunning(true);
    setResetTrigger((x) => !x);
    setModal(null);
    setTileImages(null);

    const updatedState = {
      ...baseState,
      currentPuzzle: {
        stage,
        tiles: board,
        startTiles: startLayout,
        moves: 0,
        startedAt: Date.now(),
        previewImage: null,
        tileImages: null,
      },
    };

    setGameState(updatedState);
    saveGameState(storageUser, updatedState);

    // PHOTO PART
    try {
      const previewImage = await fetchRandomImage();
      const images = await splitImageIntoTiles(previewImage, stage);

      const withImageState = {
        ...updatedState,
        currentPuzzle: {
          ...updatedState.currentPuzzle,
          previewImage,
          tileImages: images,
        },
      };

      setTileImages(images);
      setGameState(withImageState);
      saveGameState(storageUser, withImageState);
    } catch (err) {
      console.error("Image loading failed:", err);
    }
  }

  // ----------------------------------------------------
  // Move tile
  // ----------------------------------------------------
  function indexToRC(i) {
    return { r: Math.floor(i / size), c: i % size };
  }

  function areNeighbors(i, j) {
    const a = indexToRC(i);
    const b = indexToRC(j);
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  function moveTile(idx) {
    const blank = tiles.indexOf(0);
    if (!areNeighbors(idx, blank)) return;

    const next = [...tiles];
    [next[idx], next[blank]] = [next[blank], next[idx]];
    setTiles(next);
    setMoves((m) => m + 1);
    setHintIndex(null);

    if (checkSolved(next)) {
      setRunning(false);
      handleSolve();
    }
  }

  // ----------------------------------------------------
  // HINT BUTTON (3 max, avoid repeats)
  // ----------------------------------------------------
  function handleHint() {
    if (hintCount >= 3) return;

    const blank = tiles.indexOf(0);
    const hintTile = getHintMove(tiles, size, previousHintIndex);

    if (hintTile === null || hintTile === undefined) return;

    setHintIndex(hintTile);
    setPreviousHintIndex(hintTile);
    setHintCount((h) => h + 1);

    setTimeout(() => setHintIndex(null), 700);
  }

  // ----------------------------------------------------
  // Solve / give up
  // ----------------------------------------------------
  function handleSolve() {
    const timeTaken = seconds;

    const { state: updatedState } = recordSolve(gameState, timeTaken, size);

    setGameState(updatedState);
    saveGameState(storageUser, updatedState);

    setModal({
      type: "solved",
      time: timeTaken,
      moves,
    });
  }

  function handleGiveUp() {
    setRunning(false);

    const { state: updatedState, demoted, newStage } = recordGiveUp(
      gameState,
      size
    );

    setGameState(updatedState);
    saveGameState(storageUser, updatedState);

    if (demoted) {
      // show the "Let's try something easier..." message
      setModal({
        type: "demoted",
        newStage,
      });
    } else {
      generateNewPuzzle(updatedState.currentStage, updatedState);
    }
  }

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  if (!gameState) return null;

  // puzzles remaining until next unlock (never negative)
  const puzzlesLeft = Math.max(
    0,
    SOLVES_TO_UNLOCK - (gameState.solvedStreak || 0)
  );

  // Slightly different tile sizes per grid so buttons don't get shoved down
  const baseTileSize =
    size === 3 ? 110 : size === 4 ? 95 : 80; // 3x3 biggest, 5x5 smallest

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-start pt-8">
      <h1 className="text-4xl font-extrabold text-green-400 mb-1">TileRush</h1>

      <p className="text-gray-300 text-sm mb-4">
        {puzzlesLeft} puzzles until next size unlock
      </p>

      <Timer
        autoStart
        running={running}
        resetTrigger={resetTrigger}
        onTick={setSeconds}
      />

      {/* GRID */}
      <div
        className="grid gap-1 mt-2 border border-gray-700 bg-gray-800 p-4 rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(${baseTileSize}px, ${baseTileSize}px))`,
        }}
      >
        {tiles.map((v, i) => (
          <Tile
            key={i}
            value={v}
            index={i}
            onClick={moveTile}
            imageTiles={tileImages}
            className={`${
              v === 0
                ? "bg-transparent"
                : "bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded"
            } ${hintIndex === i ? "outline outline-4 outline-yellow-300" : ""}`}
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-300 flex flex-col items-center text-center">
        <p>Moves: {moves}</p>
        <p>
          Grid: {size}×{size}
        </p>
        <p className="mt-1 text-purple-300">Hints used: {hintCount}/3</p>
      </div>

      <div className="flex gap-6 mt-8">
        <button
          onClick={() => {
            setTiles(initialBoard);
            setMoves(0);
            setSeconds(0);
            setHintIndex(null);
            setHintCount(0);
            setPreviousHintIndex(null);
            setRunning(true);
            setResetTrigger((x) => !x);
            setModal(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5"
        >
          Reset
        </button>

        <button
          onClick={handleHint}
          disabled={hintCount >= 3}
          className={`px-6 py-2 rounded-lg font-semibold border-b-4 transition-all ${
            hintCount >= 3
              ? "bg-gray-600 border-gray-700 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600 border-purple-700"
          }`}
        >
          Hint ({hintCount}/3)
        </button>

        <button
          onClick={handleGiveUp}
          className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-red-700 active:translate-y-0.5"
        >
          Give Up
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5"
        >
          Exit
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[360px] text-center shadow-xl">
            {modal.type === "solved" && (
              <>
                <h2 className="text-2xl font-bold mb-3 text-green-400">
                  Nice work! 🎉
                </h2>
                <p>
                  Time: <span className="font-mono">{fmt(modal.time)}</span>
                </p>
                <p>Moves: {modal.moves}</p>

                <div className="flex justify-center gap-3 mt-5">
                  <button
                    onClick={() =>
                      generateNewPuzzle(gameState.currentStage, gameState)
                    }
                    className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5"
                  >
                    Next Puzzle
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5"
                  >
                    Exit
                  </button>
                </div>
              </>
            )}

            {modal.type === "demoted" && (
              <>
                <h2 className="text-2xl font-bold mb-3 text-yellow-300">
                  Let&apos;s try something easier
                </h2>
                <p className="mb-4 text-sm text-gray-200">
                  You&apos;ve given up 5 times on this stage, so we&apos;re
                  moving you down to{" "}
                  <span className="font-semibold">
                    {modal.newStage}×{modal.newStage}
                  </span>
                  .
                </p>
                <button
                  onClick={() => {
                    setModal(null);
                    generateNewPuzzle(
                      gameState.currentStage,
                      gameState
                    );
                  }}
                  className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5"
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
