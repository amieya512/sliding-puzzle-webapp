// src/Menu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function Menu() {
  const navigate = useNavigate();
  const { startGuest } = useAuth();

  const handleGuestPlay = () => {
    startGuest(); // ✅ sets guest = true in AuthContext
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_60%)] pointer-events-none"></div>

      {/* Puzzle-grid logo */}
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

      <h1 className="text-6xl font-extrabold mb-10 tracking-wide text-green-400 drop-shadow-lg">
        TileRush
      </h1>

      <div className="flex flex-row gap-8">
        <button
          onClick={handleGuestPlay}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Play as Guest
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Sign In
        </button>

        <button
          onClick={() => navigate("/account")}
          className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-lg font-semibold border-b-4 border-purple-700 active:translate-y-0.5 transition-all shadow-md"
        >
          Create Account
        </button>
      </div>

      <p className="absolute bottom-6 text-gray-400 text-sm italic">
        Guest progress will not be saved.
      </p>
    </div>
  );
}

export default Menu;
