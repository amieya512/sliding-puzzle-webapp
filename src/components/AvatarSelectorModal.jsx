// src/components/AvatarSelectorModal.jsx
import React from "react";

export default function AvatarSelectorModal({ selected, onSelect, onClose }) {
  const avatars = ["😎", "👾", "🐉", "🧩", "🐺", "🎮", "🦊", "🦁", "🐱", "🐸", "🐼"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-80 border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Choose Avatar</h2>

        <div className="grid grid-cols-4 gap-3 justify-items-center">
          {avatars.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className={`text-3xl p-2 rounded-md ${
                selected === emoji
                  ? "bg-green-600 scale-110"
                  : "bg-gray-800 hover:bg-gray-700"
              } transition-transform`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
