// src/Race.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tile from "./components/Tile";
import Timer from "./components/Timer";
import {
  newSolvableBoard,
  isSolved as checkSolved,
} from "./utils/shuffle";
import { computeBotMoves } from "./utils/botSolver";
import { DIALOGUE } from "./bots/dialogue";

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

  const size = initialSize || 3; // keep race at 3×3 for now
  const difficulty = (rawDifficulty || "Easy").toLowerCase();

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

  // For chat bubbles
  const [botMessage, setBotMessage] = useState(null);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleTimeoutRef = useRef(null);
  const lastSpeechRef = useRef(0);

  // --- Helpers for neighbor checks (same logic as Puzzle) ---
  function indexToRC(index) {
    return { r: Math.floor(index / size), c: index % size };
  }

  function areNeighbors(i, j) {
    const a = indexToRC(i);
    const b = indexToRC(j);
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }


  // --- Dialogue helpers ---
  function getDialoguePool() {
    const entry = DIALOGUE?.[botName];
    if (!entry) return [];

    // Support both:
    //  - DIALOGUE[botName] = [ "line1", "line2" ]
    //  - DIALOGUE[botName] = { easy: [...], medium: [...], default: [...] }
    if (Array.isArray(entry)) return entry;

    const pool =
      entry[difficulty] ||
      entry[rawDifficulty] ||
      entry.default ||
      [];
    return Array.isArray(pool) ? pool : [];
  }

  function speakRandomLine() {
    const pool = getDialoguePool();
    if (!pool.length) return;

    const now = Date.now();
    // avoid spammy speech
    if (now - lastSpeechRef.current < 3500) return;

    lastSpeechRef.current = now;
    const line = pool[Math.floor(Math.random() * pool.length)];

    setBotMessage(line);
    setShowBubble(true);

    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => {
      setShowBubble(false);
    }, 4000);
  }

  // --- Difficulty distortion: adds mistakes / detours ---
  function applyDifficultyDistortion(sequence, mode) {
    const seq = [...sequence];

    if (mode === "easy") {
      // Lots of extra dumbness: repeats & random side moves
      for (let i = 1; i < seq.length - 1; i++) {
        if (Math.random() < 0.25 && i > 0) {
          // Repeat previous move (like undoing progress)
          seq.splice(i, 0, seq[i - 1]);
          i++;
        }
        if (Math.random() < 0.2) {
          // Insert some random step from another part of the path
          const r = Math.floor(Math.random() * seq.length);
          seq.splice(i, 0, seq[r]);
          i++;
        }
      }
    }

    if (mode === "medium") {
      // Occasionally backtrack a bit
      for (let i = 1; i < seq.length - 2; i++) {
        if (Math.random() < 0.1 && i > 0) {
          seq.splice(i, 0, seq[i - 1]);
          i++;
        }
      }
    }

    if (mode === "adaptive") {
      // Mostly smart, small imperfections
      for (let i = 1; i < seq.length - 1; i++) {
        if (Math.random() < 0.05 && i > 0) {
          seq.splice(i, 0, seq[i - 1]);
          i++;
        }
      }
    }

    // Hard = pure optimal (no distortion)
    return seq;
  }

  // --- Difficulty-based delay ---
  function getDelayMs(mode) {
    switch (mode) {
      case "easy":
        return 1200 + Math.floor(Math.random() * 600); // very slow + jittery
      case "medium":
        return 750 + Math.floor(Math.random() * 300); // moderate
      case "hard":
        return 330 + Math.floor(Math.random() * 120); // fast
      case "adaptive":
        return 600 + Math.floor(Math.random() * 250); // in-between for now
      default:
        return 700;
    }
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

    // Pre-compute bot move sequence (optimal path)
    let moves = computeBotMoves(board, size);
    // Distort moves according to difficulty
    moves = applyDifficultyDistortion(moves, difficulty);
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

    // Reset dialogue
    setBotMessage(null);
    setShowBubble(false);
    lastSpeechRef.current = 0;
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);

    // Small delay then bot "speaks"
    const startSpeech = setTimeout(() => {
      speakRandomLine();
    }, 600);

    return () => {
      clearTimeout(startSpeech);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, navigate, location.state, difficulty]); // recalc when difficulty or race target changes

  // --- Bot auto-move effect (single sequence, no restarts) ---
  useEffect(() => {
    if (!botMoveSequence.length) return;
    if (raceOverRef.current) return;

    let i = 0;
    let cancelled = false;

    function step() {
      if (cancelled || raceOverRef.current) return;

      // Done with planned path
      if (i >= botMoveSequence.length) {
        // If bot somehow reaches solved state here
        setBotTiles((prev) => {
          if (checkSolved(prev) && !raceOverRef.current) {
            raceOverRef.current = true;
            setRaceOver(true);
            setWinner((w) => w || "bot");
            setBotRunning(false);
            setPlayerRunning(false);
          }
          return prev;
        });
        return;
      }

      const delay = getDelayMs(difficulty);

      botTimerRef.current = setTimeout(() => {
        if (cancelled || raceOverRef.current) return;

        const moveIdx = botMoveSequence[i];

        setBotTiles((prev) => {
          const blankIdx = prev.indexOf(0);
          if (!areNeighbors(moveIdx, blankIdx)) {
            // If somehow not neighbors (due to distortion), just keep board
            return prev;
          }

          const next = [...prev];
          [next[blankIdx], next[moveIdx]] = [next[moveIdx], next[blankIdx]];

          // Bot may solve here
          if (checkSolved(next) && !raceOverRef.current) {
            raceOverRef.current = true;
            setRaceOver(true);
            setWinner("bot");
            setBotRunning(false);
            setPlayerRunning(false);

            // final "I won" style line
            speakRandomLine();
          } else if (
            i === 1 ||
            i === Math.floor(botMoveSequence.length / 2)
          ) {
            // Occasional chatter mid-game
            speakRandomLine();
          }

          return next;
        });

        setBotMovesCount((c) => c + 1);
        i += 1;

        if (!raceOverRef.current && i < botMoveSequence.length) {
          step();
        }
      }, delay);
    }

    step();

    return () => {
      cancelled = true;
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botMoveSequence, difficulty]); // DO NOT depend on botTiles to avoid restarts

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

      // Player wins → bot reacts once
      speakRandomLine();
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
    // show something instead of pure blank white
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-300 text-sm">Loading race...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center pt-8">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">
        Race a Bot
      </h1>

      {/* Bot header + chat bubble (to the RIGHT of avatar) */}
      <div className="flex items-center gap-4 mb-6 relative">
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

        {showBubble && botMessage && (
          <div className="absolute left-full ml-4 top-0 max-w-xs">
            <div className="bg-white text-gray-900 text-sm px-3 py-2 rounded-2xl shadow-lg border border-gray-200">
              {botMessage}
            </div>
          </div>
        )}
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
            // rematch with same settings
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
