import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Large, responsive LEFT / RIGHT buttons. Pointer-based, no keyboard repeat dependency.
export default function MobileControls({ onLeft, onRight }) {
  const press = (fn) => (e) => {
    e.preventDefault();
    (e.target).setPointerCapture?.(e.pointerId);
    fn(true);
  };
  const release = (fn) => (e) => {
    e.preventDefault();
    fn(false);
  };

  const btn =
    "select-none touch-none flex-1 h-16 sm:h-20 flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 text-white active:bg-white/30 active:scale-95 transition shadow-lg";

  return (
    <div className="relative z-20 flex gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <button
        aria-label="Move left"
        className={btn}
        onPointerDown={press(onLeft)}
        onPointerUp={release(onLeft)}
        onPointerCancel={release(onLeft)}
        onPointerLeave={release(onLeft)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        aria-label="Move right"
        className={btn}
        onPointerDown={press(onRight)}
        onPointerUp={release(onRight)}
        onPointerCancel={release(onRight)}
        onPointerLeave={release(onRight)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}