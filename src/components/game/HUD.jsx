import React from "react";
import { Pause, Trophy, Volume2, VolumeX } from "lucide-react";

function Heart({ filled }) {
  return (
    <span
      className={`text-lg leading-none transition-all duration-200 ${
        filled ? "text-rose-500 scale-100" : "text-white/25 scale-90"
      }`}
    >
      ❤
    </span>
  );
}

export default function HUD({
  score,
  best,
  lives,
  combo,
  soundOn,
  onTogglePause,
  onToggleSound,
  onOpenLeaderboard,
}) {
  const ctrlBtn =
    "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition border border-white/15";
  return (
    <div className="relative z-20 flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-b from-amber-950/85 to-amber-900/65 text-white backdrop-blur-sm border-b border-amber-700/40 shadow-md">
      {/* Left: score + best */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="flex flex-col leading-none">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-200/80">Score</span>
          <span className="text-xl sm:text-2xl font-extrabold tabular-nums">{score}</span>
        </div>
        <div className="flex flex-col leading-none pl-2.5 border-l border-amber-200/25">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-200/80">Best</span>
          <span className="text-sm sm:text-lg font-bold tabular-nums text-amber-200">{best}</span>
        </div>
      </div>

      {/* Center: combo badge */}
      <div className="flex items-center">
        {combo >= 2 && (
          <div className="flex flex-col items-center leading-none px-2.5 py-1 rounded-lg bg-yellow-400/15 border border-yellow-300/30">
            <span className="text-[9px] uppercase tracking-wider text-yellow-200/90">Combo</span>
            <span className="text-sm sm:text-lg font-extrabold text-yellow-300 tabular-nums">x{combo}</span>
          </div>
        )}
      </div>

      {/* Right: lives + buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <Heart key={i} filled={i < lives} />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onTogglePause} aria-label="Pause" className={ctrlBtn}>
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={onOpenLeaderboard} aria-label="Leaderboard" className={ctrlBtn}>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
          </button>
          <button
            onClick={onToggleSound}
            aria-label={soundOn ? "Sound off" : "Sound on"}
            className={ctrlBtn}
          >
            {soundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}