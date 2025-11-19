// src/components/SettingsModal.jsx
import React, { useState } from "react";
import AvatarSelectorModal from "./AvatarSelectorModal";

export default function SettingsModal({
  currentAvatar,
  currentUsername,
  onUpdate,
  onClose,
}) {
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    // simple username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Usernames may only contain letters, numbers, and underscores.");
      return;
    }
    if (username.length < 3 || username.length > 15) {
      setError("Username must be between 3–15 characters.");
      return;
    }
    setError("");
    onUpdate({ username, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-96 border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Account Settings</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
            />
          </div>

          <div className="flex flex-col items-center mt-2">
            <p className="text-gray-300 text-sm mb-2">Avatar</p>
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="text-4xl mb-2"
            >
              {avatar}
            </button>
            <p className="text-gray-400 text-xs">Click to change</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mt-2">{error}</p>
          )}

          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-md text-white font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showAvatarPicker && (
        <AvatarSelectorModal
          selected={avatar}
          onSelect={(a) => {
            setAvatar(a);
            setShowAvatarPicker(false);
          }}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
}
