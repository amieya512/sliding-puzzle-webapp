import { useState, useEffect } from "react";

export default function Timer({ autoStart = false, onTick }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (onTick) onTick(seconds);
  }, [seconds, onTick]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center p-4 rounded-lg shadow-md bg-gray-100 w-64">
      <h3 className="font-semibold text-lg mb-2">Timer</h3>
      <div className="text-3xl font-mono mb-4 text-blue-700">
        {formatTime(seconds)}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
        >
          Start
        </button>
        <button
          onClick={() => setIsRunning(false)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded"
        >
          Stop
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
