import React from "react";
import { Play, BookOpen, UserRound, Trophy } from "lucide-react";

export default function HomeScreen({ player, onStart, onHowTo, onProfile, onLeaderboard }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-amber-100 via-orange-100 to-rose-100">
      {/* decorative glows */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-orange-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-rose-300/25 blur-3xl" />

      {/* rangoli rings */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] aspect-square rounded-full border border-orange-300/20" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] aspect-square rounded-full border border-amber-300/20" />

      {/* floating petals */}
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute text-2xl opacity-70 festive-petal"
          style={{ left: `${(i * 12 + 6) % 94}%`, top: `${(i * 19) % 78}%`, animationDelay: `${i * 0.7}s` }}
        >
          {i % 2 ? "🌼" : "🌸"}
        </span>
      ))}

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Om crest with diya & marigold */}
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-xl festive-glow" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg flex items-center justify-center text-4xl">
            🕉️
          </div>
          <span className="absolute -top-1 -right-2 text-2xl">🪔</span>
          <span className="absolute -bottom-2 -left-2 text-xl">🌼</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
          MODAK RUSH
        </h1>
        <p className="mt-1 text-lg sm:text-xl font-bold text-orange-700">Ganesh Festival Challenge</p>

        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-amber-200 shadow-sm">
          <span className="text-sm font-semibold text-rose-600">Ganpati Bappa Morya 🙏</span>
          <span className="text-amber-300">•</span>
          <span className="text-sm font-semibold text-orange-600">Celebrate • Catch • Score!</span>
        </div>

        {player && (
          <p className="mt-4 text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-orange-700">{player.player_name}</span>
          </p>
        )}

        <div className="mt-7 w-full space-y-3">
          <button
            onClick={onStart}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-lg font-extrabold shadow-xl active:scale-95 transition"
          >
            <Play className="w-6 h-6" /> START GAME
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onHowTo}
              className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/80 border border-amber-200 text-orange-700 font-bold shadow-sm active:scale-95 transition"
            >
              <BookOpen className="w-5 h-5" /> HOW TO PLAY
            </button>
            <button
              onClick={onProfile}
              className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/80 border border-amber-200 text-orange-700 font-bold shadow-sm active:scale-95 transition"
            >
              <UserRound className="w-5 h-5" /> {player ? "EDIT PLAYER" : "PROFILE"}
            </button>
          </div>
          <button
            onClick={onLeaderboard}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white/60 border border-amber-200 text-amber-700 font-semibold shadow-sm active:scale-95 transition"
          >
            <Trophy className="w-5 h-5 text-amber-500" /> LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}