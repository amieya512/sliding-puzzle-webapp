// src/CustomPuzzle.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Timer from "./components/Timer";
import Tile from "./components/Tile";
import { isSolved as checkSolved, newSolvableBoard } from "./utils/shuffle";
import { splitImageIntoTiles } from "./utils/splitImage";
import { getHintMove } from "./utils/getHintMove";

export default function CustomPuzzle() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = location.state || {};
  const size = params.size || 3;
  const imageSrc = params.imageSrc || null;

  const [tiles, setTiles] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [tileImages, setTileImages] = useState(null);

  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [running, setRunning] = useState(true);
  const [modal, setModal] = useState(null);

  // Hint system
  const [hintIndex, setHintIndex] = useState(null);
  const [hintCount, setHintCount] = useState(0);        // limit = 3
  const [previousHintIndex, setPreviousHintIndex] = useState(null);

  useEffect(() => {
    if (!imageSrc) {
      navigate("/create");
      return;
    }

    const board = newSolvableBoard(size);
    setTiles(board);
    setInitialBoard(board);

    async function loadImage() {
      try {
        const pieces = await splitImageIntoTiles(imageSrc, size);
        setTileImages(pieces); // array
      } catch (err) {
        console.error("Error slicing custom image:", err);
      }
    }

    loadImage();
  }, [size, imageSrc, navigate]);

  function indexToRC(i) {
    return { r: Math.floor(i / size), c: i % size };
  }

  function areNeighbors(i, j) {
    const a = indexToRC(i);
    const b = indexToRC(j);
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  function moveTile(idx) {
    const blankIdx = tiles.indexOf(0);
    if (!areNeighbors(idx, blankIdx)) return;

    const next = [...tiles];
    [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]];

    setTiles(next);
    setMoves((m) => m + 1);
    setHintIndex(null); // clear highlight after move

    if (checkSolved(next)) {
      setRunning(false);
      setModal({ type: "solved", time: seconds, moves });
    }
  }

  // HINT: 3 max, avoid repeating same tile
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

  const baseTileSize = size === 3 ? 110 : size === 4 ? 95 : 80;

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  if (!imageSrc) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center pt-8">

      <h1 className="text-4xl font-extrabold text-green-400 mb-1">TileRush</h1>
      <p className="text-gray-300 text-sm mb-4">Custom {size}×{size} Puzzle</p>

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

      {/* STATS */}
      <div className="mt-4 text-sm text-gray-300 text-center">
        <p>Moves: {moves}</p>
        <p>Grid: {size}×{size}</p>
        <p className="mt-1 text-purple-300">Hints used: {hintCount}/3</p>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-6 mt-8">

        {/* Reset */}
        <button
          onClick={() => {
            setTiles(initialBoard);
            setMoves(0);
            setSeconds(0);
            setRunning(true);
            setResetTrigger((x) => !x);
            setHintIndex(null);
            setHintCount(0);
            setPreviousHintIndex(null);
            setModal(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-blue-700"
        >
          Reset
        </button>

        {/* Hint (replaces Give Up) */}
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

        {/* Exit */}
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold border-b-4 border-green-700"
        >
          Exit
        </button>
      </div>

      {/* WIN MODAL */}
      {modal && modal.type === "solved" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-[360px] text-center shadow-xl">

            <h2 className="text-2xl font-bold mb-3 text-green-400">Nice work! 🎉</h2>
            <p>Time: {fmt(modal.time)}</p>
            <p>Moves: {modal.moves}</p>

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => navigate("/create")}
                className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-blue-700"
              >
                Create Another
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-green-700"
              >
                Exit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
