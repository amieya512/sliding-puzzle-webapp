import React, { useState } from "react";
import AvatarSelectorModal from "./AvatarSelectorModal";

function SettingsModal({ currentAvatar, currentUsername, onUpdate, onClose }) {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [error, setError] = useState("");

  const validateUsername = (name) => {
    const regex = /^[A-Za-z0-9_]{3,15}$/;
    if (!regex.test(name)) {
      setError(
        "Username must be 3–15 characters and only include letters, numbers, or underscores."
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = () => {
    if (!validateUsername(username)) return;
    onUpdate({ username, avatar });
    onClose();
  };

  const handleAvatarSelect = (newAvatar) => {
    setAvatar(newAvatar);
    setShowAvatarModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
        <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-[90%] max-w-md text-white">
          <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
            Account Settings
          </h2>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-3xl mb-3">
              {avatar}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5 transition-all"
            >
              Change Avatar
            </button>
          </div>

          {/* Username Section */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:border-green-500"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <AvatarSelectorModal
          currentAvatar={avatar}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </>
  );
}

export default SettingsModal;
