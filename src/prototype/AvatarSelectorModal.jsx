import React from "react";

const emojiAvatars = [
  "🧩", "👾", "🤖", "🐉", "🦊", "🐱", "🐻", "🦉",
  "🎮", "🔥", "⚡", "⭐", "👑", "🎭", "💀", "🧠"
];

function AvatarSelectorModal({ currentAvatar, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
          Choose Your Avatar
        </h2>
        <div className="grid grid-cols-4 gap-4 justify-items-center">
          {emojiAvatars.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className={`text-3xl p-2 rounded-full transition-all ${
                emoji === currentAvatar
                  ? "bg-green-600 scale-110"
                  : "hover:bg-gray-700"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarSelectorModal;
