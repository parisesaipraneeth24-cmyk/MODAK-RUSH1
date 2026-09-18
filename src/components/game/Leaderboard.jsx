import React, { useState, useEffect, useCallback } from "react";
import { Trophy, X, Loader2, Medal } from "lucide-react";
import { fetchLeaderboard } from "@/lib/playerUtils";

function Row({ rank, name, campus, score, highlight }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
        highlight ? "bg-amber-100 border border-amber-300" : "bg-white/70"
      }`}
    >
      <div className="w-7 text-center font-bold text-sm shrink-0">
        {medal ? <span className="text-base">{medal}</span> : <span className="text-muted-foreground">{rank}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-muted-foreground truncate">{campus}</div>
      </div>
      <div className="font-extrabold text-orange-600 tabular-nums text-sm shrink-0">{score}</div>
    </div>
  );
}

export default function Leaderboard({ campus, playerName, onClose }) {
  const [tab, setTab] = useState("all");
  const [data, setData] = useState({ all: [], myCampus: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await fetchLeaderboard(campus);
      setData(d);
    } catch (e) {
      setError("Could not load leaderboard. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [campus]);

  useEffect(() => {
    load();
  }, [load]);

  const list = tab === "all" ? data.all : data.myCampus;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-extrabold text-orange-700">Leaderboard</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close leaderboard"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-100 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 p-3">
        <button
          onClick={() => setTab("all")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition ${
            tab === "all" ? "bg-orange-500 text-white shadow" : "bg-white text-orange-700 border border-amber-200"
          }`}
        >
          All Campuses
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition ${
            tab === "mine" ? "bg-orange-500 text-white shadow" : "bg-white text-orange-700 border border-amber-200"
          }`}
        >
          My Campus
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin mb-2" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-rose-600 mb-3">{error}</p>
            <button onClick={load} className="text-sm font-semibold text-orange-600 underline">
              Retry
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Medal className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No players yet.</p>
          </div>
        ) : (
          list.map((p, i) => (
            <Row
              key={p.id}
              rank={i + 1}
              name={p.player_name}
              campus={p.campus}
              score={p.best_score}
              highlight={tab === "mine" && playerName && p.player_name === playerName}
            />
          ))
        )}
      </div>
    </div>
  );
}