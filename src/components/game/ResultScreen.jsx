import React, { useState } from "react";
import { Trophy, RefreshCw, Pencil, Sparkles, Home } from "lucide-react";
import Leaderboard from "./Leaderboard";

export default function ResultScreen({
  player,
  result,
  bestScore,
  syncPending,
  onRetrySync,
  onPlayAgain,
  onEditPlayer,
  onHome,
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (showLeaderboard) {
    return (
      <Leaderboard
        campus={player.campus}
        playerName={player.player_name}
        onClose={() => setShowLeaderboard(false)}
      />
    );
  }

  const stat = (label, value, accent) => (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/80 px-2 py-3 shadow-sm">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums ${accent || "text-foreground"}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
            FESTIVAL COMPLETE!
          </h1>
          <p className="text-lg font-bold text-orange-700 mt-1">{player.player_name}</p>
          <p className="text-sm text-muted-foreground">{player.campus}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {stat("Your Score", result.score, "text-orange-600")}
          {stat("Best Score", bestScore, "text-amber-600")}
          {stat("Best Combo", `x${result.bestCombo}`, "text-rose-500")}
          {stat("Accuracy", `${result.accuracy}%`, "text-emerald-600")}
        </div>

        {syncPending ? (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-sm text-amber-700 font-medium text-center">Score saved locally. Leaderboard sync unavailable.</p>
            <button
              onClick={onRetrySync}
              className="mt-1 mx-auto flex items-center gap-1 text-sm font-semibold text-orange-600 underline"
            >
              <RefreshCw className="w-4 h-4" /> Retry sync
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-emerald-600 font-medium mb-4">Score saved to leaderboard ✓</p>
        )}

        <div className="text-center mb-6 py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200">
          <p className="text-xl font-extrabold text-orange-700">Ganpati Bappa Morya 🙏</p>
          <p className="text-sm text-rose-600 mt-1">Happy Vinayaka Chaturthi 🪔</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg active:scale-95 transition"
          >
            <Trophy className="w-5 h-5" /> VIEW LEADERBOARD
          </button>
          <button
            onClick={onPlayAgain}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-lg active:scale-95 transition"
          >
            <RefreshCw className="w-5 h-5" /> PLAY AGAIN
          </button>
          <button
            onClick={onEditPlayer}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white border border-amber-200 text-orange-700 font-semibold shadow-sm active:scale-95 transition"
          >
            <Pencil className="w-5 h-5" /> EDIT PLAYER
          </button>
          <button
            onClick={onHome}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white border border-amber-200 text-amber-700 font-semibold shadow-sm active:scale-95 transition"
          >
            <Home className="w-5 h-5" /> BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
}