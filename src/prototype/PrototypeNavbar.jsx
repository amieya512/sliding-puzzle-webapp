import React from "react";
import { LogOut, Settings } from "lucide-react";

function PrototypeNavbar({
  username = "GuestUser",
  avatar,
  onLogout,
  onSettings,
}) {
  return (
    <div className="w-full bg-gray-950 text-gray-200 flex items-center justify-between px-10 py-3 shadow-md border-b border-gray-800">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold tracking-widest text-green-400">
          TileRush
        </h1>
      </div>

      {/* Center: Username + Avatar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-lg">
          {avatar || username[0].toUpperCase()}
        </div>
        <span className="font-medium">{username}</span>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSettings}
          className="hover:text-blue-400 transition-colors"
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
        <button
          onClick={onLogout}
          className="hover:text-red-400 transition-colors"
          aria-label="Log out"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}

export default PrototypeNavbar;
