// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from "./Menu";
import Login from "./Login";
import Account from "./Account";
import Username from "./Username";  // <-- for Google username setup
import Dashboard from "./Dashboard";
import Puzzle from "./Puzzle";
import CreatePuzzle from "./CreatePuzzle";     
import CustomPuzzle from "./CustomPuzzle";     

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home / Menu */}
        <Route path="/" element={<Menu />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />

        {/* Google signup → choose username */}
        <Route path="/username" element={<Username />} />

        {/* Main App Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/puzzle" element={<Puzzle />} />

        {/* CREATE + CUSTOM PUZZLE ROUTES (must come BEFORE fallback) */}
        <Route path="/create" element={<CreatePuzzle />} />
        <Route path="/custom-puzzle" element={<CustomPuzzle />} />

        {/* Fallback */}
        <Route path="*" element={<Menu />} />

      </Routes>
    </BrowserRouter>
  );
}
