// src/Username.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ref, set } from "firebase/database";
import { db } from "./firebase";
import { isBadUsername } from "./utils/profanity";

export default function Username() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsernameState] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const saveUsername = async () => {
    try {
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Username may only contain letters, numbers, and underscores.");
      }
      if (username.length < 3 || username.length > 15) {
        throw new Error("Username must be 3–15 characters long.");
      }
      if (isBadUsername(username)) {
        throw new Error("Please choose an appropriate username.");
      }

      await set(ref(db, `users/${user.uid}`), {
        username,
        email: user.email,
        avatar: "🧩",
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("username", username);
      localStorage.setItem("avatar", "🧩");

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <h1 className="text-5xl font-extrabold mb-10 text-green-400">TileRush</h1>

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96 border border-gray-700">
        <h2 className="text-3xl font-semibold text-center mb-6">Choose a Username</h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsernameState(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-md bg-gray-700 border border-gray-600"
        />

        <button
          onClick={saveUsername}
          className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-md font-semibold border-b-4 border-green-700"
        >
          Save Username
        </button>
      </div>
    </div>
  );
}

