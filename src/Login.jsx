import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function Login() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email.trim(), password);
      navigate("/Dashboard");
    } catch (err) {
      let msg = err.message || "Error signing in.";
      if (msg.includes("auth/invalid-credential"))
        msg = "Invalid email or password.";
      setError(msg);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      await resetPassword(email.trim());
      setResetSent(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="text-center flex flex-col items-center min-h-screen justify-center">
      <h2 className="text-xl mb-4">Sign In</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64 text-left">
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {resetSent && (
          <p className="text-green-600 text-sm">
            Password reset email sent! Check your inbox.
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded"
        >
          Sign In
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
          onClick={handleForgotPassword}
          className="text-blue-600 underline text-sm mt-1"
        >
          Forgot Password?
        </button>

        <button
          type="button"
          onClick={() => navigate("/Account")}
          className="text-green-600 underline mt-2"
        >
          Create an Account
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
