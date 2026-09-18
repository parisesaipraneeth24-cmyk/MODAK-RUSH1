import React, { useState, useCallback } from "react";
import HomeScreen from "@/components/game/HomeScreen";
import HowToPlayScreen from "@/components/game/HowToPlayScreen";
import RegistrationScreen from "@/components/game/RegistrationScreen";
import ProfileScreen from "@/components/game/ProfileScreen";
import GameView from "@/components/game/GameView";
import ResultScreen from "@/components/game/ResultScreen";
import Leaderboard from "@/components/game/Leaderboard";
import { saveGameResult } from "@/lib/playerUtils";

export default function GamePage() {
  const [phase, setPhase] = useState("home"); // home | howto | registration | profile | leaderboard | playing | result
  const [player, setPlayer] = useState(null);
  const [intent, setIntent] = useState("play"); // play | profile — what to do after registration
  const [bestScore, setBestScore] = useState(0);
  const [result, setResult] = useState(null);
  const [syncPending, setSyncPending] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);

  const handleStart = useCallback(() => {
    setIntent("play");
    if (player) {
      setResult(null);
      setPhase("playing");
    } else {
      setPhase("registration");
    }
  }, [player]);

  const handleHowTo = useCallback(() => setPhase("howto"), []);

  const handleProfile = useCallback(() => {
    setIntent("profile");
    if (player) setPhase("profile");
    else setPhase("registration");
  }, [player]);

  const handleLeaderboard = useCallback(() => setPhase("leaderboard"), []);
  const handleHome = useCallback(() => setPhase("home"), []);

  const handleRegister = useCallback(
    (p) => {
      setPlayer(p);
      setBestScore(p.best_score || 0);
      setResult(null);
      setSyncPending(false);
      setPendingSave(null);
      if (intent === "play") setPhase("playing");
      else setPhase("home");
    },
    [intent]
  );

  const handleProfileSaved = useCallback((p) => {
    setPlayer(p);
    setBestScore(p.best_score || 0);
    setPhase("home");
  }, []);

  const handleGameOver = useCallback(
    async (stats) => {
      setResult(stats);
      setPhase("result");
      if (!player) return;
      setSyncPending(true);
      setPendingSave({ player, stats });
      try {
        const updated = await saveGameResult(
          player,
          stats.score,
          stats.bestCombo,
          stats.accuracy,
          stats.livesRemaining
        );
        setPlayer(updated);
        setBestScore(updated.best_score || 0);
        setSyncPending(false);
        setPendingSave(null);
      } catch (e) {
        setSyncPending(true);
      }
    },
    [player]
  );

  const retrySync = useCallback(async () => {
    if (!pendingSave) return;
    setSyncPending(true);
    try {
      const updated = await saveGameResult(
        pendingSave.player,
        pendingSave.stats.score,
        pendingSave.stats.bestCombo,
        pendingSave.stats.accuracy,
        pendingSave.stats.livesRemaining
      );
      setPlayer(updated);
      setBestScore(updated.best_score || 0);
      setSyncPending(false);
      setPendingSave(null);
    } catch (e) {
      setSyncPending(true);
    }
  }, [pendingSave]);

  const handlePlayAgain = useCallback(() => {
    setResult(null);
    setSyncPending(false);
    setPendingSave(null);
    setPhase("playing");
  }, []);

  if (phase === "home") {
    return (
      <HomeScreen
        player={player}
        onStart={handleStart}
        onHowTo={handleHowTo}
        onProfile={handleProfile}
        onLeaderboard={handleLeaderboard}
      />
    );
  }
  if (phase === "howto") {
    return <HowToPlayScreen onBack={handleHome} />;
  }
  if (phase === "registration") {
    return <RegistrationScreen onRegister={handleRegister} />;
  }
  if (phase === "profile" && player) {
    return <ProfileScreen player={player} onSaved={handleProfileSaved} onBack={handleHome} />;
  }
  if (phase === "leaderboard") {
    return (
      <Leaderboard
        campus={player?.campus}
        playerName={player?.player_name}
        onClose={handleHome}
      />
    );
  }
  if (phase === "playing" && player) {
    return <GameView player={player} bestScore={bestScore} onGameOver={handleGameOver} onHome={handleHome} />;
  }
  if (phase === "result" && player && result) {
    return (
      <ResultScreen
        player={player}
        result={result}
        bestScore={bestScore}
        syncPending={syncPending}
        onRetrySync={retrySync}
        onPlayAgain={handlePlayAgain}
        onEditPlayer={() => setPhase("profile")}
        onHome={handleHome}
      />
    );
  }
  return (
    <HomeScreen
      player={player}
      onStart={handleStart}
      onHowTo={handleHowTo}
      onProfile={handleProfile}
      onLeaderboard={handleLeaderboard}
    />
  );
}