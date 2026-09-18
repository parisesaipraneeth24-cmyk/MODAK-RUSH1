import React from "react";
import { Play, BookOpen, Home } from "lucide-react";

export default function PauseOverlay({ onResume, onHowTo, onHome }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm px-6">
      <div className="text-center w-full max-w-xs">
        <h2 className="text-3xl font-extrabold text-white mb-1">PAUSED</h2>
        <p className="text-amber-200 text-sm mb-6">Take a breath, the festival waits.</p>
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-lg active:scale-95 transition"
          >
            <Play className="w-5 h-5" /> RESUME
          </button>
          <button
            onClick={onHowTo}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-white/15 border border-white/25 text-white font-semibold active:scale-95 transition"
          >
            <BookOpen className="w-5 h-5" /> HOW TO PLAY
          </button>
          <button
            onClick={onHome}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-white/15 border border-white/25 text-white font-semibold active:scale-95 transition"
          >
            <Home className="w-5 h-5" /> BACK TO HOME
          </button>
        </div>
        <p className="text-amber-200/70 text-xs mt-4">Leaving will end this round.</p>
      </div>
    </div>
  );
}