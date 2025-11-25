import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// avatars
import BenjiSVG from "../bots/Inquizitive Blond Man.svg";
import OliverSVG from "../bots/Serious Hipster.svg";
import MapleSVG from "../bots/Grandma.svg";
import FoxySVG from "../bots/FoxGuy.svg";

export default function RaceBotModal({ onClose }) {
  const navigate = useNavigate();

  const bots = [
    {
      name: "Benji",
      avatar: BenjiSVG,
      tagline: "Fast-thinking optimist",
    },
    {
      name: "Oliver",
      avatar: OliverSVG,
      tagline: "Calm and calculated",
    },
    {
      name: "Ms. Maple",
      avatar: MapleSVG,
      tagline: "Patient but sharp",
    },
    {
      name: "Foxy",
      avatar: FoxySVG,
      tagline: "Chaotic speed-solver",
    },
  ];

  const difficulties = ["Easy", "Medium", "Hard", "Adaptive"];

  const [selectedBot, setSelectedBot] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");

  function startRace() {
    if (!selectedBot) return;

    navigate("/race", {
      state: {
        botName: selectedBot.name,
        botAvatar: selectedBot.avatar,
        difficulty,
        size: 3, // default puzzle size
      },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[420px] shadow-xl text-white">
        <h2 className="text-2xl font-bold text-green-400 text-center mb-4">
          Choose Your Opponent
        </h2>

        {/* BOT GRID */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {bots.map((bot) => (
            <button
              key={bot.name}
              onClick={() => setSelectedBot(bot)}
              className={`p-3 rounded-xl border ${
                selectedBot?.name === bot.name
                  ? "border-green-400 bg-gray-800"
                  : "border-gray-700 bg-gray-800/60 hover:bg-gray-800"
              }`}
            >
              <img src={bot.avatar} alt={bot.name} className="w-24 mx-auto" />
              <p className="text-center font-semibold mt-2">{bot.name}</p>
              <p className="text-xs text-gray-400 text-center">{bot.tagline}</p>
            </button>
          ))}
        </div>

        {/* DIFFICULTY SELECTOR */}
        <div className="mb-5">
          <p className="text-sm mb-1 font-semibold text-gray-300">
            Difficulty:
          </p>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg border-b-4 border-red-800"
          >
            Cancel
          </button>

          <button
            onClick={startRace}
            disabled={!selectedBot}
            className={`px-5 py-2 rounded-lg border-b-4 ${
              selectedBot
                ? "bg-green-500 hover:bg-green-600 border-green-700"
                : "bg-gray-700 border-gray-600 cursor-not-allowed"
            }`}
          >
            Start Race
          </button>
        </div>
      </div>
    </div>
  );
}
