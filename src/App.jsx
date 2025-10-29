// src/App.jsx
import Puzzle from "./Puzzle";
import Timer from "./components/Timer"; 

export default function App() {
  return (
    <div className="p-10 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold">Sliding Puzzle</h1>
      <Puzzle size={3} />
      <div>
        <h2 className="text-xl font-semibold mb-2">Timer</h2>
        <Timer />
      </div>
    </div>
  );
}