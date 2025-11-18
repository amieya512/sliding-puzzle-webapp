// src/Account.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ref, set } from "firebase/database";
import { db } from "./firebase";
import { isBadUsername } from "./utils/profanity";

export default function Account() {
  const { signUp, signInWithGoogle } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("Username may only contain letters, numbers, and underscores.");
      }
      if (username.length < 3 || username.length > 15) {
        throw new Error("Username must be 3–15 characters long.");
      }
      if (isBadUsername(username)) {
        throw new Error("Please choose a cleaner username.");
      }

      const userCredential = await signUp(email, password);
      const user = userCredential.user;

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

  const handleGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      navigate("/username");
    } catch (err) {
      setError("Google sign-up failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <h1 className="text-5xl font-extrabold mb-8 text-green-400">TileRush</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-96 border border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 border border-gray-600"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 border border-gray-600"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-md bg-gray-700 border border-gray-600"
        />

        <button
          type="submit"
          className="w-full bg-purple-500 hover:bg-purple-600 py-2 rounded-md font-semibold border-b-4 border-purple-700"
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-md font-semibold border-b-4 border-red-700 mt-4"
        >
          Sign Up with Google
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:underline"
          >
            Log In
          </button>
        </p>
      </form>

      <button
        onClick={() => navigate("/menu")}
        className="text-gray-400 text-sm mt-6 hover:text-white"
      >
        ← Back to Menu
      </button>
    </div>
  );
}
