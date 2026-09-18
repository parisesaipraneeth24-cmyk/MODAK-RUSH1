import React from "react";
import { ArrowLeft } from "lucide-react";

function Card({ emoji, title, children, accent }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-amber-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji}</span>
        <h3 className={`font-extrabold ${accent || "text-orange-700"}`}>{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function HowToPlayScreen({ onBack, backLabel = "BACK TO HOME" }) {
  return (
    <div className="min-h-[100dvh] w-full overflow-y-auto bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-3 text-3xl">
            🎮
          </div>
          <h1 className="text-3xl font-extrabold text-orange-700">How to Play</h1>
          <p className="text-sm text-muted-foreground mt-1">MODAK RUSH — Ganesh Festival Challenge</p>
        </div>

        <div className="space-y-3">
          <Card emoji="🎯" title="GOAL" accent="text-orange-700">
            Catch as many festive offerings as possible and achieve the highest score before you lose all your lives.
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card emoji="🍡" title="MODAK  +10" accent="text-amber-700">The beloved sweet. Catch it!</Card>
            <Card emoji="🌸" title="FLOWERS / DURVA  +5" accent="text-rose-600">Sacred blooms & grass. Catch them!</Card>
          </div>

          <Card emoji="❌" title="WRONG OBJECT  −1 LIFE" accent="text-rose-600">
            Avoid the spiky red object. Catching it costs a life and resets your combo.
          </Card>

          <Card emoji="❤️" title="LIVES" accent="text-rose-600">
            You start with 3 lives. The game ends only when all 3 lives are lost — there is <span className="font-semibold text-foreground">no timer</span>.
          </Card>

          <Card emoji="🏆" title="COMBO" accent="text-amber-700">
            Catch correct objects continuously to build your combo. A wrong catch resets it.
          </Card>

          <Card emoji="🕹️" title="CONTROLS" accent="text-orange-700">
            <div className="space-y-1">
              <p><span className="font-semibold text-foreground">Laptop / Desktop:</span> ← / A = Move Left · → / D = Move Right</p>
              <p><span className="font-semibold text-foreground">Mobile / Tablet:</span> Use the on-screen LEFT / RIGHT buttons.</p>
            </div>
          </Card>

          <div className="rounded-2xl bg-amber-100/70 border border-amber-200 p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">Game ends when:</p>
            <p>• All 3 lives are lost. <span className="text-rose-600 font-semibold">There is no time limit.</span></p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-lg active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" /> {backLabel}
        </button>
      </div>
    </div>
  );
}