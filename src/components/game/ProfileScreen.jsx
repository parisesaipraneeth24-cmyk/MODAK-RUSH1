import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserRound } from "lucide-react";
import CampusSelect from "./CampusSelect";
import { updatePlayerProfile } from "@/lib/playerUtils";

export default function ProfileScreen({ player, onSaved, onBack }) {
  const [niatId, setNiatId] = useState(player?._niatId || "");
  const [playerName, setPlayerName] = useState(player?.player_name || "");
  const [campus, setCampus] = useState(player?.campus || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const valid =
    niatId.trim().length >= 2 && playerName.trim().length >= 2 && campus.trim().length > 0;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updatePlayerProfile(
        player,
        niatId.trim(),
        playerName.trim(),
        campus.trim()
      );
      setDone(true);
      setTimeout(() => onSaved({ ...updated, _niatId: niatId.trim() }), 650);
    } catch (e) {
      setError("Could not save. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3">
            <UserRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-orange-700">Your Profile</h1>
          <p className="text-sm text-muted-foreground">Edit your player details</p>
        </div>

        <Card className="border-amber-200/60 shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">NIAT ID / Roll ID</Label>
              <Input
                value={niatId}
                onChange={(e) => setNiatId(e.target.value)}
                placeholder="e.g. N240001"
                autoCapitalize="none"
                autoCorrect="off"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Player Name</Label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your full name"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">NIAT Campus</Label>
              <CampusSelect value={campus} onChange={setCampus} />
            </div>

            {player?.best_score ? (
              <p className="text-xs text-muted-foreground">
                Best Score: <span className="font-bold text-orange-600">{player.best_score}</span>
              </p>
            ) : null}

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {done && (
              <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                Profile saved ✓
              </p>
            )}

            <Button
              onClick={handleSave}
              disabled={!valid || saving}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg disabled:opacity-40"
            >
              {saving ? "Saving..." : "SAVE PROFILE"}
            </Button>
            <button
              onClick={onBack}
              className="w-full h-11 flex items-center justify-center gap-2 text-orange-700 font-semibold active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" /> BACK TO HOME
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Your NIAT ID is kept private and never shown on the leaderboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}