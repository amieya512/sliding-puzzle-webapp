// src/App.jsx

import Menu from "./Menu";
import Puzzle from "./Puzzle";
import Dashboard from "./Dashboard";
import Login from "./Login";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {

  return (
    <div className="p-10 flex flex-col items-center gap-8">
      <BrowserRouter>
      <h1 className="text-3xl font-bold mb-6">Sliding Puzzle Game</h1>
      
      <Routes>
       <Route path= "/" element={<Menu />} />
       <Route path="/Menu" element={<Menu />} />
       <Route path="/Puzzle" element={<Puzzle />} />
       <Route path="/Dashboard" element={<Dashboard />} />
       <Route path="/Login" element={<Login />} />
      </Routes>
      </BrowserRouter>
    </div>
    
    
  );
}
