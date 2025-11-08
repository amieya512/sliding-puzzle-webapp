import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrototypeNavbar from "./PrototypeNavbar";
import SettingsModal from "./SettingsModal";

function PrototypeDashboard() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("GuestUser");
  const [avatar, setAvatar] = useState("🧩");
  const [showSettings, setShowSettings] = useState(false);

  // Load stored data
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    const savedAvatar = localStorage.getItem("avatar");
    if (savedUser) setUsername(savedUser);
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const handleUpdate = ({ username, avatar }) => {
    setUsername(username);
    setAvatar(avatar);
    localStorage.setItem("username", username);
    localStorage.setItem("avatar", avatar);
  };

  const currentStage = "3×3";
  const completedPuzzles = 25;
  const avgTime = "01:43";
  const bestStageTime = "00:52";
  const currentPuzzleImage =
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Sliding_puzzle_3x3_numbers.svg";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      <PrototypeNavbar
        username={username}
        avatar={avatar}
        onLogout={() => navigate("/Prototype")}
        onSettings={() => setShowSettings(true)}
      />

      {/* Stats Row */}
      <div className="flex flex-row justify-center gap-16 mt-10 text-center">
        <div>
          <p className="text-3xl font-bold text-blue-400">{currentStage}</p>
          <p className="text-gray-300 text-sm">Current Stage</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-green-400">
            {completedPuzzles}
          </p>
          <p className="text-gray-300 text-sm">Puzzles Completed</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-yellow-400">{avgTime}</p>
          <p className="text-gray-300 text-sm">Avg Completion Time</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-purple-400">{bestStageTime}</p>
          <p className="text-gray-300 text-sm">Best {currentStage} Time</p>
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
              Begin or continue your latest puzzle.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/Prototype/game")}
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
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => alert("Feature coming soon")}
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
              onClick={() => alert("Coming soon")}
              className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold border-b-4 border-yellow-700 active:translate-y-0.5 transition-all"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 mt-12 italic text-sm">
        Guest progress resets when the page is closed.
      </p>

      {showSettings && (
        <SettingsModal
          currentAvatar={avatar}
          currentUsername={username}
          onUpdate={handleUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default PrototypeDashboard;
