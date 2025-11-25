// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "./context/AuthContext";

import {
  loadGameState,
  getAverageTimeForStage,
} from "./utils/gameState";

import SettingsModal from "./components/SettingsModal";
import RaceBotModal from "./components/RaceBotModal";   // ← NEW IMPORT

function Dashboard() {
  const navigate = useNavigate();
  const { user, guest, signOutUser } = useAuth();

  const storageUser = user || null;
  const [gameState, setGameState] = useState(null);

  const [username, setUsername] = useState("GuestUser");
  const [avatar, setAvatar] = useState("🧩");

  const [showSettings, setShowSettings] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false); // ← NEW STATE

  // Load saved UI username/avatar + game state
  useEffect(() => {
    if (guest) {
      setUsername("GuestUser");
      setAvatar("🧩");
    } else if (user) {
      const savedUser = localStorage.getItem("username");
      const savedAvatar = localStorage.getItem("avatar");

      setUsername(savedUser || user.displayName || "Player");
      setAvatar(savedAvatar || "👾");
    }

    const state = loadGameState(storageUser);
    setGameState(state);
  }, [user, guest]);

  if (!gameState) return null;

  // REAL STATS FROM gameState
  const currentStage = gameState.currentStage;

  const stageStats =
    gameState.perStage[String(currentStage)] || {
      completed: 0,
      bestTime: null,
      totalTime: 0,
      attempts: 0,
    };

  const puzzlesCompleted = stageStats.completed || 0;

  const bestStageTime = stageStats.bestTime;
  const avgTime = getAverageTimeForStage(gameState, currentStage);

  const fmt = (sec) => {
    if (sec == null) return "—";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Puzzle preview
  let currentPuzzleImage =
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Sliding_puzzle_3x3_numbers.svg";

  if (gameState.currentPuzzle && gameState.currentPuzzle.previewImage) {
    currentPuzzleImage = gameState.currentPuzzle.previewImage;
  }

  const handleLogout = () => {
    signOutUser();
    navigate("/menu");
  };

  const handleUpdateUser = ({ username: newName, avatar: newAvatar }) => {
    setUsername(newName);
    setAvatar(newAvatar);

    localStorage.setItem("username", newName);
    localStorage.setItem("avatar", newAvatar);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <div className="w-full bg-gray-950 text-gray-200 flex items-center justify-between px-10 py-3 shadow-md border-b border-gray-800">
        <h1 className="text-xl font-extrabold tracking-widest text-green-400">
          TileRush
        </h1>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-lg">
            {avatar}
          </div>
          <span className="font-medium">{username}</span>
          {guest && (
            <span className="text-xs text-gray-400 italic">(Guest Mode)</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* ⚙️ Settings only for logged-in users */}
          {!guest && (
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-blue-400 transition-colors"
              aria-label="Settings"
            >
              <Settings size={22} />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="hover:text-red-400 transition-colors"
            aria-label="Log out"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-row justify-center gap-16 mt-10 text-center">
        <div>
          <p className="text-3xl font-bold text-blue-400">
            {currentStage}×{currentStage}
          </p>
          <p className="text-gray-300 text-sm">Current Stage</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-green-400">
            {puzzlesCompleted}
          </p>
          <p className="text-gray-300 text-sm">Puzzles Completed</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-yellow-400">
            {fmt(avgTime)}
          </p>
          <p className="text-gray-300 text-sm">Avg Completion Time</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-purple-400">
            {fmt(bestStageTime)}
          </p>
          <p className="text-gray-300 text-sm">
            Best {currentStage}×{currentStage} Time
          </p>
        </div>
      </div>

      {/* Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-16 mt-14">
        {/* Play Puzzle */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-b-4 border-green-600 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-3">Play Puzzle</h3>

            <img
              src={currentPuzzleImage}
              alt="Current Puzzle Preview"
              className="w-full h-48 object-contain rounded-md mb-6 border border-gray-700 bg-gray-900"
            />

            <p className="text-gray-400 mb-6">
              Continue your latest puzzle or start a new challenge.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate("/puzzle")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5 transition-all"
            >
              Start
            </button>
          </div>
        </div>

        {/* Create Puzzle */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-b-4 border-blue-600 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-3">Create a Puzzle</h3>
            <p className="text-gray-400 mb-6">
              Upload your own image and craft a new challenge for others.
              Customized puzzle records are not recorded.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate("/create")}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5 transition-all"
            >
              Create
            </button>
          </div>
        </div>

        {/* Race a Bot */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-b-4 border-yellow-600 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-3">Race a Bot</h3>
            <p className="text-gray-400 mb-6">
              Compete against an adaptive AI opponent to test your speed.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowRaceModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold border-b-4 border-yellow-700 active:translate-y-0.5 transition-all"
            >
              Race
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-gray-400 mt-12 italic text-sm">
        {guest
          ? "Guest progress resets when the page is closed."
          : "Your progress is saved automatically."}
      </p>

      {/* Settings Modal */}
      {!guest && showSettings && (
        <SettingsModal
          currentAvatar={avatar}
          currentUsername={username}
          onUpdate={handleUpdateUser}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Race Bot Modal */}
      {showRaceModal && (
        <RaceBotModal onClose={() => setShowRaceModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;
