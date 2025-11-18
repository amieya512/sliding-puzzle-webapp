// src/components/Timer.jsx
import { useEffect, useState } from "react";

export default function Timer({
  autoStart = true,
  running = true,          // <- parent controls start/stop
  resetTrigger,            // <- toggle to reset to 00:00
  onTick,                  // <- send seconds up to parent
}) {
  const [seconds, setSeconds] = useState(0);

  // reset to 0 whenever resetTrigger changes
  useEffect(() => {
    setSeconds(0);
  }, [resetTrigger]);

  // tick while running
  useEffect(() => {
    let id;
    const shouldRun = running || (autoStart && running === undefined);
    if (shouldRun) {
      id = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(id);
  }, [running, autoStart]);

  useEffect(() => {
    if (onTick) onTick(seconds);
  }, [seconds, onTick]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <h3 className="font-semibold text-lg mb-2">Time</h3>
      <div className="text-3xl font-mono text-green-400">{fmt(seconds)}</div>
    </div>
  );
}
