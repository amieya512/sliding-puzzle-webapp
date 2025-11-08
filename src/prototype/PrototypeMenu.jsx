import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PrototypeDashboard from "./PrototypeDashboard";
import PrototypeGame from "./PrototypeGame";

function PrototypeMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_60%)] pointer-events-none"></div>

      {/* Gameboard logo */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-8 drop-shadow-lg"
      >
        <rect x="5" y="5" width="25" height="25" fill="#22C55E" rx="4" />
        <rect x="37.5" y="5" width="25" height="25" fill="#16A34A" rx="4" />
        <rect x="70" y="5" width="25" height="25" fill="#15803D" rx="4" />
        <rect x="5" y="37.5" width="25" height="25" fill="#15803D" rx="4" />
        <rect x="37.5" y="37.5" width="25" height="25" fill="#22C55E" rx="4" />
        <rect x="70" y="37.5" width="25" height="25" fill="#16A34A" rx="4" />
        <rect x="5" y="70" width="25" height="25" fill="#16A34A" rx="4" />
        <rect x="37.5" y="70" width="25" height="25" fill="#15803D" rx="4" />
        <rect x="70" y="70" width="25" height="25" fill="#22C55E" rx="4" />
      </svg>

      {/* Title */}
      <h1 className="text-6xl font-extrabold mb-10 tracking-wide text-green-400 drop-shadow-lg">
        TileRush
      </h1>

      {/* Buttons */}
      <div className="flex flex-row gap-8">
        <button
          onClick={() => navigate("/Prototype/dashboard")}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Play as Guest
        </button>

        <button
          onClick={() => alert('Sign-in not implemented here')}
          className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Sign In
        </button>

        <button
          onClick={() => alert('Create account not implemented here')}
          className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-purple-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Create Account
        </button>
      </div>

      <p className="absolute bottom-6 text-gray-400 text-sm italic">
        Guest progress will not be saved.
      </p>

      {/* Proper routing */}
      <Routes>
        <Route path="/dashboard" element={<PrototypeDashboard />} />
        <Route path="/game" element={<PrototypeGame />} />
      </Routes>
    </div>
  );
}

export default PrototypeMenu;
