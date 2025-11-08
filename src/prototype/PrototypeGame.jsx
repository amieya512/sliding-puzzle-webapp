import React from "react";
import { useNavigate } from "react-router-dom";

function PrototypeGame() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
      <h2 className="text-3xl font-semibold mb-6">Puzzle Game (Prototype)</h2>

      <div className="w-96 h-96 bg-gray-700 rounded-lg grid grid-cols-3 gap-2 p-2 shadow-inner shadow-gray-800">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-600 flex items-center justify-center text-2xl font-bold rounded"
          >
            {i + 1}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/Prototype/dashboard")}
        className="mt-10 bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold border-b-4 border-yellow-700 active:translate-y-0.5 transition-all"
      >
        Return to Dashboard
      </button>

      <p className="mt-6 text-gray-400 italic text-sm">
        Guest progress will not be saved.
      </p>
    </div>
  );
}

export default PrototypeGame;
