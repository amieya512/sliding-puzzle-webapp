// src/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ref, get, child } from "firebase/database";
import { db } from "./firebase";

function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // check if username exists
      const snapshot = await get(child(ref(db), `users/${user.uid}`));

      if (snapshot.exists() && snapshot.val()?.username) {
        // returning user → go straight to dashboard
        const data = snapshot.val();
        localStorage.setItem("username", data.username);
        localStorage.setItem("avatar", data.avatar || "🧩");
        navigate("/dashboard");
      } else {
        // first-time Google sign-in → username setup
        navigate("/username");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google Sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center text-white">
      <h1 className="text-5xl font-extrabold mb-8 text-green-400">TileRush</h1>

      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-96 border border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-green-500 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-green-500 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md font-semibold border-b-4 border-green-700 transition-all"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-semibold border-b-4 border-red-700 transition-all mt-4"
        >
          Sign in with Google
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/account")}
            className="text-blue-400 hover:underline"
          >
            Create one
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

export default Login;
