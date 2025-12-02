// src/components/ChatBubble.jsx
import React from "react";

export default function ChatBubble({ text }) {
  if (!text) return null;

  return (
    <div className="absolute right-0 -top-4 translate-x-full bg-white text-black px-3 py-2 rounded-2xl shadow-lg max-w-[160px] text-sm animate-fade">
      {text}
    </div>
  );
}
