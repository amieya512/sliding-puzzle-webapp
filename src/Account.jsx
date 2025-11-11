// src/Account.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { ref, get, set } from "firebase/database";

function Account() {
  const { user, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isGoogleUserWithoutUsername, setIsGoogleUserWithoutUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check if Google user has username
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = ref(db, "users/" + user.uid);
        const snap = await get(userRef);

        if (snap.exists() && snap.val()?.username) {
          navigate("/Dashboard");
        } else if (
          user?.providerData?.some((p) => p.providerId === "google.com")
        ) {
          setIsGoogleUserWithoutUsername(true);
        }
      } catch (err) {
        console.warn("Database check error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    try {
      if (isGoogleUserWithoutUsername && user) {
        await set(ref(db, "users/" + user.uid), {
          uid: user.uid,
          email: user.email ?? null,
          username: username.trim(),
          updatedAt: Date.now(),
        });
        navigate("/Dashboard");
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Email and password are required.");
          return;
        }

        const cred = await signUp(email.trim(), password);
        const newUser = cred.user;
        await set(ref(db, "users/" + newUser.uid), {
          uid: newUser.uid,
          email: newUser.email ?? email.trim(),
          username: username.trim(),
          createdAt: Date.now(),
        });
        navigate("/Dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return null;

  const title = isGoogleUserWithoutUsername
    ? "Complete Your Profile"
    : "Create an Account";

  return (
    <div className="text-center flex flex-col items-center min-h-screen justify-center">
      <h2 className="text-xl mb-4">{title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64 text-left">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
          required
        />

        {!isGoogleUserWithoutUsername && !user && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          </>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          {isGoogleUserWithoutUsername ? "Save Username" : "Create Account"}
        </button>

        {!user && (
          <button
            type="button"
            onClick={handleGoogle}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded"
          >
            Sign up with Google
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate("/Login")}
          className="text-blue-500 underline mt-2"
        >
          Already have an account? Log in
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

export default Account;
