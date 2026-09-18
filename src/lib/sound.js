// Lightweight Web Audio sound effects — no external files, no autoplay.
let audioCtx = null;
let soundEnabled = true;

export function setSoundEnabled(v) {
  soundEnabled = v;
}

export function getSoundEnabled() {
  return soundEnabled;
}

function ensureCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Call once on a user gesture so audio is unlocked on mobile.
export function unlockAudio() {
  ensureCtx();
}

function tone(freq, duration, type = "sine", gain = 0.12, slideTo = null) {
  const ctx = ensureCtx();
  if (!ctx || !soundEnabled) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
  }
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

export function playCatchSound(combo = 1) {
  const base = 520 + Math.min(combo, 12) * 45;
  tone(base, 0.16, "triangle", 0.12, base * 1.5);
}

export function playFlowerSound() {
  tone(660, 0.14, "sine", 0.1, 880);
}

export function playWrongSound() {
  tone(220, 0.28, "sawtooth", 0.14, 90);
}

export function playGameOverSound() {
  const ctx = ensureCtx();
  if (!ctx || !soundEnabled) return;
  [523, 440, 349, 262].forEach((f, i) => {
    setTimeout(() => tone(f, 0.3, "triangle", 0.12), i * 140);
  });
}

export function playStartSound() {
  tone(440, 0.12, "triangle", 0.1, 660);
  setTimeout(() => tone(660, 0.14, "triangle", 0.1, 880), 120);
}