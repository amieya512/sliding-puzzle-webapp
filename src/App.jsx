// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from "./Menu";
import Puzzle from "./Puzzle";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Account from "./Account";
import PrototypeMenu from "./prototype/PrototypeMenu";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main production routes */}
        <Route path="/" element={<Menu />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Puzzle" element={<Puzzle />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Account" element={<Account />} />

        {/* Prototype sandbox route */}
        <Route path="/Prototype/*" element={<PrototypeMenu />} />
      </Routes>
    </BrowserRouter>
  );
}
