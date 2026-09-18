import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ChevronDown, Check, Gamepad2 } from "lucide-react";
import { NIAT_CAMPUSES } from "@/components/data/campuses";
import { findOrCreatePlayer } from "@/lib/playerUtils";
import { unlockAudio, playStartSound } from "@/lib/sound";

export default function RegistrationScreen({ onRegister, initial }) {
  const [niatId, setNiatId] = useState(initial?.niatId || "");
  const [playerName, setPlayerName] = useState(initial?.playerName || "");
  const [campus, setCampus] = useState(initial?.campus || "");
  const [campusOpen, setCampusOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NIAT_CAMPUSES;
    return NIAT_CAMPUSES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  const valid =
    niatId.trim().length >= 2 && playerName.trim().length >= 2 && campus.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      unlockAudio();
      const player = await findOrCreatePlayer(niatId.trim(), playerName.trim(), campus.trim());
      playStartSound();
      onRegister({ ...player, _niatId: niatId.trim() });
    } catch (e) {
      setError("Could not register. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const onKeySubmit = (e) => {
    if (e.key === "Enter" && valid && !submitting) handleSubmit();
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3">
            <Gamepad2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
            MODAK RUSH
          </h1>
          <p className="text-base sm:text-lg font-semibold text-orange-700 mt-1">
            Ganesh Festival Challenge
          </p>
          <p className="text-sm text-muted-foreground mt-2">Register to Play</p>
        </div>

        <Card className="border-amber-200/60 shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="niat" className="text-sm font-semibold">
                NIAT ID / Roll ID <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="niat"
                value={niatId}
                onChange={(e) => setNiatId(e.target.value)}
                onKeyDown={onKeySubmit}
                placeholder="e.g. N240001"
                autoCapitalize="none"
                autoCorrect="off"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pname" className="text-sm font-semibold">
                Player Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="pname"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={onKeySubmit}
                placeholder="Your full name"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                NIAT Campus <span className="text-rose-500">*</span>
              </Label>
              <Popover open={campusOpen} onOpenChange={setCampusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-12 justify-between text-base font-normal"
                  >
                    <span className={campus ? "text-foreground truncate" : "text-muted-foreground"}>
                      {campus || "Search and select your campus"}
                    </span>
                    <ChevronDown className="w-5 h-5 opacity-60 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    setTimeout(() => inputRef.current?.focus(), 30);
                  }}
                >
                  <div className="flex items-center border-b px-3">
                    <Search className="w-4 h-4 mr-2 opacity-50" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search campus..."
                      className="flex h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-[280px] overflow-y-auto overscroll-contain">
                    {filtered.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No campus found.
                      </div>
                    ) : (
                      filtered.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCampus(c);
                            setCampusOpen(false);
                            setQuery("");
                          }}
                          className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-amber-50 active:bg-amber-100 transition-colors"
                        >
                          <Check
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              campus === c ? "opacity-100 text-orange-600" : "opacity-0"
                            }`}
                          />
                          <span className="leading-snug">{c}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!valid || submitting}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg disabled:opacity-40"
            >
              {submitting ? "Starting..." : "START GAME"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your NIAT ID is kept private and never shown on the leaderboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}