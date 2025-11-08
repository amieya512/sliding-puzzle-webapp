// src/Account.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { db, auth } from "./firebase";
import {
  ref,
  get,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { deleteUser } from "firebase/auth";
import { Filter } from "bad-words";

const filter = new Filter();

function Account() {
  const { user, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isGoogleUserWithoutUsername, setIsGoogleUserWithoutUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ Only prompt Google users for username setup
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
          user?.providerData?.some((p) => p.providerId === "google.com") &&
          (!snap.exists() || !snap.val()?.username)
        ) {
          setIsGoogleUserWithoutUsername(true);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.warn("Database check error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [user, navigate]);

  // ✅ Local validation
  const validateLocally = () => {
    const uname = username.trim();

    if (uname.length < 3 || uname.length > 16)
      throw new Error("Username must be 3–16 characters long.");
    if (/\s/.test(uname) || /[^a-zA-Z0-9_]/.test(uname))
      throw new Error("Username can only contain letters, numbers, and underscores.");
    if (filter.isProfane(uname))
      throw new Error("Please choose an appropriate username.");

    if (!isGoogleUserWithoutUsername) {
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters long.");
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
        throw new Error("Password must contain at least one number and one capital letter.");
      if (password !== confirmPassword)
        throw new Error("Passwords do not match.");
    }
  };

  // ✅ Main submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      validateLocally();

      if (isGoogleUserWithoutUsername && user) {
        await handleUsernameSave(user.uid, user.email);
        return;
      }

      const cred = await signUp(email.trim(), password);
      const newUser = cred.user;
      if (!newUser?.uid)
        throw new Error("Account creation failed. Please try again.");

      const uname = username.trim();

      // Check for duplicate username AFTER signup (auth required)
      const usernameQuery = query(
        ref(db, "users"),
        orderByChild("username"),
        equalTo(uname)
      );
      const result = await get(usernameQuery);

      if (result.exists()) {
        await deleteUser(auth.currentUser);
        throw new Error("Username is already taken. Please choose another.");
      }

      // ✅ Safe write, then redirect only after success
      await set(ref(db, "users/" + newUser.uid), {
        uid: newUser.uid,
        email: newUser.email ?? email.trim(),
        username: uname,
        createdAt: Date.now(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/Dashboard"), 1000);
    } catch (err) {
      console.error("Signup error:", err);
      let msg = err.message || "Unknown error occurred.";
      if (msg.includes("PERMISSION_DENIED"))
        msg = "Database permissions blocked or invalid session.";
      if (msg.includes("auth/weak-password"))
        msg = "Password too weak — use 8+ characters with a number & symbol.";
      if (msg.includes("auth/email-already-in-use"))
        msg = "That email is already registered.";
      if (msg.includes("auth/invalid-email"))
        msg = "Please enter a valid email address.";
      setError(msg);
    }
  };

  // ✅ Handle Google username save
  const handleUsernameSave = async (uid, email) => {
    try {
      const uname = username.trim();
      const usernameQuery = query(
        ref(db, "users"),
        orderByChild("username"),
        equalTo(uname)
      );
      const result = await get(usernameQuery);
      if (result.exists()) throw new Error("Username is already taken.");

      await set(ref(db, "users/" + uid), {
        uid,
        email,
        username: uname,
        updatedAt: Date.now(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/Dashboard"), 1000);
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

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md mb-2">
          Account created successfully! Redirecting...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-64 text-left"
      >
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
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
