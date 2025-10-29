// src/Puzzle.jsx
import { useEffect, useMemo, useState } from "react";
import Tile from "./components/Tile";
import {
  isSolved as checkSolved,
  newSolvableBoard,
} from "./utils/shuffle";


export default function Puzzle({ size = 3, onMove, onSolved }) {

  const [tiles, setTiles] = useState(() => newSolvableBoard(size));
  const [moves, setMoves] = useState(0);

 
  useEffect(() => {
    reset(size);
   
  }, [size]);

  const solved = useMemo(() => checkSolved(tiles), [tiles]);


  function reset(s = size) {
    setTiles(newSolvableBoard(s));
    setMoves(0);
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
    onMove?.({ tiles: next, moves: nextMoves, solved: nowSolved });
    if (nowSolved) onSolved?.({ moves: nextMoves });
  }

  function shuffle() {
    reset(size); 
  }


  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex items-center gap-2">
        <button
          onClick={shuffle}
          className="px-3 py-1 rounded bg-blue-600 text-white"
        >
          Shuffle
        </button>
        <button
          onClick={() => reset(size)}
          className="px-3 py-1 rounded bg-gray-600 text-white"
        >
          Reset
        </button>
        <span className="ml-2 text-sm text-gray-700">Moves: {moves}</span>
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
    </div>
  );
}
