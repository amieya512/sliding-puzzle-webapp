// src/Menu.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function Menu() {
  const navigate = useNavigate();
  const { user, guest, loading, startGuest, signOutUser } = useAuth();

  // 🔹 Once auth finishes loading:
  //    - If logged in, go straight to Dashboard
  //    - If guest, clear guest state
  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate("/Dashboard");
      return;
    }

    if (guest) {
      signOutUser(); // reset ghost guest state
    }
  }, [loading, user, guest, navigate, signOutUser]);

  const handleGuestPlay = () => {
    startGuest();
    navigate("/Dashboard");
  };

  // 🔹 Show loading placeholder while Firebase initializes
  if (loading) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Main Menu</h2>

      {/* Show sign-in options only when not logged in or guest */}
      {!user && !guest && (
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => navigate("/Login")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-3 py-3 rounded"
          >
            Log-In
          </button>

          <button
            onClick={() => navigate("/Account")}
            className="bg-green-500 hover:bg-green-700 text-white font-bold px-3 py-3 rounded"
          >
            Create Account
          </button>

          <button
            onClick={handleGuestPlay}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold px-3 py-3 rounded"
          >
            Play as Guest
          </button>
        </div>
      )}

      <h1 className="font-semibold mt-4">
        Note: Guest progress will not be saved
      </h1>
    </div>
  );
}

export default Menu;
