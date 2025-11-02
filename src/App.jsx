// src/App.jsx

import Timer from "./components/Timer";
import Menu from "./Menu";
import Puzzle from "./Puzzle";
import Dashboard from "./Dashboard";
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
      </Routes>

      {/* Puzzle Grid Section
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Puzzle Grid</h2>
        <Puzzle size={3} />
      </section>

      Timer Section
      <section className="text-center">
        <h2 className="text-xl font-semibold mb-2">Timer</h2>
        <Timer />
      </section> */}

      {/* Menu Section */}

      {/* Dash Section
      <section className="text-center">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <Dashboard />
      </section> */}
      </BrowserRouter>
    </div>
    
    
  );
}
