import React, { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/lib/gameEngine";
import { setSoundEnabled, unlockAudio } from "@/lib/sound";
import HUD from "./HUD";
import MobileControls from "./MobileControls";
import Leaderboard from "./Leaderboard";
import PauseOverlay from "./PauseOverlay";
import HowToPlayScreen from "./HowToPlayScreen";

export default function GameView({ player, bestScore, onGameOver, onHome }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0 });
  const [paused, setPaused] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [best, setBest] = useState(bestScore || 0);

  useEffect(() => {
    unlockAudio();
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const engine = new GameEngine(canvas, {
      onHud: (h) => setHud(h),
      onGameOver: (stats) => onGameOver(stats),
    });
    engineRef.current = engine;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      engine.resize(rect.width, rect.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);

    const onKeyDown = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        e.preventDefault();
        engine.setLeft(true);
      } else if (["ArrowRight", "d", "D"].includes(e.key)) {
        e.preventDefault();
        engine.setRight(true);
      } else if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
      }
    };
    const onKeyUp = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) engine.setLeft(false);
      else if (["ArrowRight", "d", "D"].includes(e.key)) engine.setRight(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const resetInputs = () => engine.resetInputs();
    window.addEventListener("blur", resetInputs);
    document.addEventListener("visibilitychange", resetInputs);

    engine.start();

    return () => {
      engine.destroy();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", resetInputs);
      document.removeEventListener("visibilitychange", resetInputs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevTouch = document.body.style.touchAction;
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.touchAction = prevTouch;
    };
  }, []);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !engine.running) return;
    setPaused((p) => {
      if (p) {
        engine.resume();
        return false;
      } else {
        engine.pause();
        return true;
      }
    });
  }, []);

  const openLeaderboard = useCallback(() => {
    const engine = engineRef.current;
    if (engine) engine.pause();
    engine?.resetInputs();
    setPaused(false);
    setShowLeaderboard(true);
  }, []);

  const closeLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
    const engine = engineRef.current;
    if (engine && engine.running) engine.resume();
  }, []);

  const openHowTo = useCallback(() => {
    // engine is already paused via pause overlay
    setShowHowTo(true);
  }, []);

  const closeHowTo = useCallback(() => {
    setShowHowTo(false);
  }, []);

  const handleHome = useCallback(() => {
    const engine = engineRef.current;
    if (engine) engine.stop();
    onHome();
  }, [onHome]);

  const toggleSound = useCallback(() => {
    setSoundOn((s) => {
      const next = !s;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 mx-auto flex flex-col overflow-hidden select-none"
      style={{
        maxWidth: "560px",
        background:
          "radial-gradient(circle at 50% 0%, #fff3d6 0%, #ffe0b2 35%, #ffcc80 70%, #ffb74d 100%)",
      }}
    >
      <HUD
        score={hud.score}
        best={best}
        lives={hud.lives}
        combo={hud.combo}
        soundOn={soundOn}
        onTogglePause={togglePause}
        onToggleSound={toggleSound}
        onOpenLeaderboard={openLeaderboard}
      />

      <div className="relative flex-1 min-h-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" />

        {/* Mobile on-screen controls */}
        <div className="md:hidden absolute bottom-0 left-0 right-0">
          <MobileControls
            onLeft={(v) => engineRef.current?.setLeft(v)}
            onRight={(v) => engineRef.current?.setRight(v)}
          />
        </div>

        {/* Desktop hint */}
        <div className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-amber-900/60 font-medium pointer-events-none">
          ← → or A / D to move
        </div>

        {paused && (
          <PauseOverlay
            onResume={togglePause}
            onHowTo={openHowTo}
            onHome={handleHome}
          />
        )}
        {showLeaderboard && (
          <Leaderboard
            campus={player.campus}
            playerName={player.player_name}
            onClose={closeLeaderboard}
          />
        )}
        {showHowTo && (
          <HowToPlayScreen onBack={closeHowTo} backLabel="BACK TO GAME" />
        )}
      </div>
    </div>
  );
}