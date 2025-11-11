// src/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let loginEmail = identifier;

      // ✅ If input doesn't contain '@', treat it as username and look up email
      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          loginEmail = snapshot.docs[0].data().email;
        } else {
          throw new Error("Username not found.");
        }
      }

      // ✅ Try to sign in with resolved email
      await signIn(loginEmail, password);
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="text-center flex flex-col items-center min-h-screen justify-center">
      <h2 className="text-xl mb-4">Login to Account</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-64 text-left"
      >
        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded"
        >
          Log In
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded"
        >
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => navigate("/Account")}
          className="text-blue-500 underline mt-2"
        >
          Need an account? Sign up
        </button>
        <button
          type="button"
          onClick={() => navigate("/Menu")}
          className="text-purple-500 underline"
        >
          Back to Menu
        </button>
      </form>
    </div>
  );
}

export default Login;
