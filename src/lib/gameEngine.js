// Canvas game engine for Modak Rush. Frame-rate independent, single RAF loop.
// No timer — the game ends only when all 3 lives are lost. Difficulty scales with score.
import {
  playCatchSound,
  playFlowerSound,
  playWrongSound,
  playGameOverSound,
} from "./sound";

// Festival illustrated background (pre-rendered 2D game art).
const BG_IMAGE_URL =
  "https://media.base44.com/images/public/6aaaa253a02e358678410c1a/9519dfd6d_generated_image.png";
const bgImage = typeof Image !== "undefined" ? new Image() : null;
let bgImageLoaded = false;
if (bgImage) {
  bgImage.onload = () => {
    bgImageLoaded = true;
  };
  bgImage.src = BG_IMAGE_URL;
}

function drawCover(ctx, img, W, H) {
  if (!img) return;
  const ir = img.width / img.height;
  const cr = W / H;
  let dw, dh, dx, dy;
  if (ir > cr) {
    dh = H;
    dw = H * ir;
    dx = (W - dw) / 2;
    dy = 0;
  } else {
    dw = W;
    dh = W / ir;
    dx = 0;
    dy = (H - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

const START_LIVES = 3;

const TYPES = {
  modak: { points: 10, positive: true, color: "#ffd54f" },
  durva: { points: 5, positive: true, color: "#9ccc65" },
  flower: { points: 5, positive: true, color: "#fb8c00" },
  wrong: { points: 0, positive: false, color: "#ef5350" },
};

// Difficulty 0..1 based on score (ramps over ~300 points).
function difficultyFor(score) {
  return Math.min(1, score / 300);
}

function pickType(diff) {
  const weights = {
    modak: 5,
    durva: 4,
    flower: 4,
    wrong: 2.4 + diff * 2.6, // more wrong objects as difficulty rises
  };
  const total = weights.modak + weights.durva + weights.flower + weights.wrong;
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) {
    r -= w;
    if (r <= 0) return k;
  }
  return "modak";
}

/* ---------- Falling object graphics ---------- */

function drawModak(ctx, r) {
  // soft glow
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.7);
  glow.addColorStop(0, "rgba(255,213,79,0.22)");
  glow.addColorStop(1, "rgba(255,213,79,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
  ctx.fill();

  // dumpling body
  const grad = ctx.createLinearGradient(0, -r, 0, r);
  grad.addColorStop(0, "#fff7e6");
  grad.addColorStop(1, "#f0c878");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, r * 0.55);
  ctx.quadraticCurveTo(-r, -r * 0.1, 0, -r * 0.78);
  ctx.quadraticCurveTo(r, -r * 0.1, r * 0.85, r * 0.55);
  ctx.quadraticCurveTo(0, r * 0.92, -r * 0.85, r * 0.55);
  ctx.fill();

  // pleats
  ctx.strokeStyle = "rgba(180,120,40,0.6)";
  ctx.lineWidth = Math.max(1, r * 0.07);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.32, r * 0.5);
    ctx.quadraticCurveTo(i * r * 0.34, -r * 0.2, i * r * 0.12, -r * 0.74);
    ctx.stroke();
  }
  // highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.18, r * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // tiny leaf on top
  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(r * 0.12, -r * 0.82, r * 0.12, r * 0.06, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawDurva(ctx, r) {
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.5);
  glow.addColorStop(0, "rgba(156,204,92,0.18)");
  glow.addColorStop(1, "rgba(156,204,92,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  const blades = 6;
  for (let i = 0; i < blades; i++) {
    const ang = (i / blades - 0.5) * 1.7;
    ctx.save();
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, 0, -r * 1.4);
    g.addColorStop(0, "#2e7d32");
    g.addColorStop(1, "#aed581");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-r * 0.09, 0);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.8, 0, -r * 1.4);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.8, r * 0.09, 0);
    ctx.fill();
    // midrib
    ctx.strokeStyle = "rgba(46,125,50,0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 1.35);
    ctx.stroke();
    ctx.restore();
  }
  // red thread tie
  ctx.strokeStyle = "#c62828";
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(-r * 0.34, r * 0.06);
  ctx.lineTo(r * 0.34, r * 0.06);
  ctx.stroke();
  // base knot
  ctx.fillStyle = "#b71c1c";
  ctx.beginPath();
  ctx.arc(0, r * 0.06, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx, r) {
  // marigold
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.6);
  glow.addColorStop(0, "rgba(251,140,0,0.2)");
  glow.addColorStop(1, "rgba(251,140,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const outer = 12;
  for (let i = 0; i < outer; i++) {
    ctx.save();
    ctx.rotate((i / outer) * Math.PI * 2);
    const g = ctx.createRadialGradient(0, -r * 0.62, r * 0.05, 0, -r * 0.62, r * 0.42);
    g.addColorStop(0, "#ffcc80");
    g.addColorStop(1, "#ef6c00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.62, r * 0.22, r * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const inner = 8;
  for (let i = 0; i < inner; i++) {
    ctx.save();
    ctx.rotate((i / inner) * Math.PI * 2 + Math.PI / 8);
    ctx.fillStyle = "#ffb74d";
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.34, r * 0.14, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#bf360c";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe082";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1, r * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWrong(ctx, r, t) {
  // warning glow
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.6);
  glow.addColorStop(0, "rgba(239,83,80,0.18)");
  glow.addColorStop(1, "rgba(239,83,80,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fill();

  const spikes = 10;
  const wobble = Math.sin(t * 0.01) * r * 0.06;
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  g.addColorStop(0, "#ef5350");
  g.addColorStop(1, "#6d1b1b");
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? r + wobble : r * 0.58;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // warning ring
  ctx.strokeStyle = "rgba(255,235,235,0.85)";
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  // X
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(1.5, r * 0.14);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, -r * 0.22);
  ctx.lineTo(r * 0.22, r * 0.22);
  ctx.moveTo(r * 0.22, -r * 0.22);
  ctx.lineTo(-r * 0.22, r * 0.22);
  ctx.stroke();
}

const DRAWERS = {
  modak: drawModak,
  durva: drawDurva,
  flower: drawFlower,
  wrong: drawWrong,
};

/* ---------- Festive background ---------- */

function drawMangoLeaf(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.3);
  const g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, "#66bb6a");
  g.addColorStop(1, "#2e7d32");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.7, 0, 0, s);
  ctx.quadraticCurveTo(-s * 0.7, 0, 0, -s);
  ctx.fill();
  ctx.strokeStyle = "rgba(46,125,50,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  ctx.stroke();
  ctx.restore();
}

function drawDiya(ctx, x, y, s, glow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.4 * glow;
  const halo = ctx.createRadialGradient(0, -s * 0.6, s * 0.2, 0, -s * 0.6, s * 1.7);
  halo.addColorStop(0, "#ffd54f");
  halo.addColorStop(1, "rgba(255,213,79,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, -s * 0.6, s * 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, 0, s * 0.5);
  g.addColorStop(0, "#b0712f");
  g.addColorStop(1, "#5d3a18");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, 0);
  ctx.quadraticCurveTo(-s * 0.9, s * 0.42, 0, s * 0.46);
  ctx.quadraticCurveTo(s * 0.9, s * 0.42, s * 0.7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.26, s * 0.18, s * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff176";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.18, s * 0.1, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRangoli(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  const colors = ["#ef6c00", "#d81b60", "#f9a825"];
  for (let k = 0; k < 3; k++) {
    const rr = r * (1 - k * 0.28);
    ctx.strokeStyle = colors[k];
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((i / 8) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, -rr * 0.5, rr * 0.18, rr * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.fillStyle = "#bf360c";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Decorative mandap arch across the top (subtle, non-interfering).
function drawArch(ctx, W) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  const top = 6;
  const h = 58;
  // pillars
  ctx.fillStyle = "#8a5a1b";
  ctx.fillRect(4, top, 9, h);
  ctx.fillRect(W - 13, top, 9, h);
  // pillar caps
  ctx.fillStyle = "#a86a1f";
  ctx.fillRect(1, top, 15, 6);
  ctx.fillRect(W - 16, top, 15, 6);
  // curved top beam
  ctx.strokeStyle = "#a86a1f";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(8, top + 4);
  ctx.quadraticCurveTo(W / 2, -14, W - 8, top + 4);
  ctx.stroke();
  // decorative dots along arch
  ctx.fillStyle = "#ffb300";
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = 8 + (W - 16) * t;
    const y = top + 4 + (Math.sin(t * Math.PI) * -18) + 18;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // central medallion
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#d4a017";
  ctx.beginPath();
  ctx.arc(W / 2, top + 6, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff3c4";
  ctx.beginPath();
  ctx.arc(W / 2, top + 6, 4, 0, Math.PI * 2);
  ctx.fill();
  // hanging tiny lamps
  ctx.globalAlpha = 0.45;
  for (let i = 1; i <= 3; i++) {
    const x = (W / 4) * i;
    ctx.strokeStyle = "rgba(120,80,20,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, top + 8);
    ctx.lineTo(x, top + 22);
    ctx.stroke();
    ctx.fillStyle = "#ffb300";
    ctx.beginPath();
    ctx.arc(x, top + 26, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Vertical marigold garland down one side.
function drawGarland(ctx, x, top, h, count) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = "rgba(120,80,20,0.4)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i <= count; i++) {
    const y = top + (h / count) * i;
    const cx = x + Math.sin(i * 0.6) * 3;
    if (i === 0) ctx.moveTo(cx, y);
    else ctx.lineTo(cx, y);
  }
  ctx.stroke();
  for (let i = 0; i <= count; i++) {
    const y = top + (h / count) * i;
    const cx = x + Math.sin(i * 0.6) * 3;
    const g = ctx.createRadialGradient(cx, y, 1, cx, y, 7);
    g.addColorStop(0, "#ffcc80");
    g.addColorStop(1, "#ef6c00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#bf360c";
    ctx.beginPath();
    ctx.arc(cx, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- Decorative thali (catching plate) ---------- */

function drawBasket(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.5, w * 0.52, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // soft glow under plate
  const glow = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 0.6);
  glow.addColorStop(0, "rgba(255,213,79,0.25)");
  glow.addColorStop(1, "rgba(255,213,79,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // scalloped decorative outer border
  const body = ctx.createLinearGradient(0, -h * 0.3, 0, h * 0.4);
  body.addColorStop(0, "#ffe082");
  body.addColorStop(0.5, "#d4a017");
  body.addColorStop(1, "#8a6d0b");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.5, h * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  // scalloped rim
  ctx.fillStyle = "#fff3c4";
  const lobes = 16;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * w * 0.48, Math.sin(a) * h * 0.4, Math.max(2, h * 0.06), 0, Math.PI * 2);
    ctx.fill();
  }

  // inner maroon ring
  ctx.strokeStyle = "#b71c1c";
  ctx.lineWidth = Math.max(2, h * 0.07);
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.01, w * 0.42, h * 0.32, 0, 0, Math.PI * 2);
  ctx.stroke();

  // inner well
  const well = ctx.createRadialGradient(0, -h * 0.05, w * 0.05, 0, 0, w * 0.4);
  well.addColorStop(0, "#6d3a0f");
  well.addColorStop(1, "#3e2010");
  ctx.fillStyle = well;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.02, w * 0.36, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  // central flower motif
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i / 6) * Math.PI * 2);
    ctx.fillStyle = "#ff8a65";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, w * 0.06, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#fff176";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2, h * 0.08), 0, Math.PI * 2);
  ctx.fill();

  // small diya dots on rim
  ctx.fillStyle = "#ffb300";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * w * 0.45, Math.sin(a) * h * 0.36, Math.max(1.5, h * 0.05), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.callbacks = callbacks || {};
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = 0;
    this.H = 0;
    this.objects = [];
    this.particles = [];
    this.floats = [];
    this.rings = [];
    this.petals = [];
    this.sparkles = [];
    this.shake = 0;
    this.flash = 0;
    this.running = false;
    this.paused = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.lastTs = 0;
    this.spawnAcc = 0;
    this.elapsed = 0;
    this.reset();
  }

  resize(cssW, cssH) {
    this.W = cssW;
    this.H = cssH;
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = cssH + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.basket) {
      this.basket.y = this.H - this.basket.h - this.H * 0.05;
      this.basket.x = Math.min(Math.max(this.basket.x, this.basket.w / 2), this.W - this.basket.w / 2);
    }
    this.initAmbient();
  }

  initAmbient() {
    const n = 10;
    this.petals = [];
    for (let i = 0; i < n; i++) {
      this.petals.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vy: 8 + Math.random() * 14,
        size: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? "#ff8a80" : "#ffd54f",
        alpha: 0.22 + Math.random() * 0.2,
      });
    }
    const s = 7;
    this.sparkles = [];
    for (let i = 0; i < s; i++) {
      this.sparkles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H * 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      });
    }
  }

  reset() {
    this.score = 0;
    this.lives = START_LIVES;
    this.combo = 0;
    this.bestCombo = 0;
    this.elapsed = 0;
    this.objects = [];
    this.particles = [];
    this.floats = [];
    this.rings = [];
    this.shake = 0;
    this.flash = 0;
    this.caughtPositive = 0;
    this.wrongCaught = 0;
    this.spawnAcc = 0;
    this.basket = {
      x: (this.W || 360) / 2,
      w: Math.min(96, Math.max(64, (this.W || 360) * 0.2)),
      h: Math.min(48, Math.max(32, (this.W || 360) * 0.1)),
      y: (this.H || 640) - Math.min(48, Math.max(32, (this.W || 360) * 0.1)) - (this.H || 640) * 0.05,
      bounce: 0,
    };
    this.emitHud();
  }

  emitHud() {
    if (this.callbacks.onHud) {
      this.callbacks.onHud({
        score: this.score,
        lives: this.lives,
        combo: this.combo,
      });
    }
  }

  start() {
    this.reset();
    this.running = true;
    this.paused = false;
    this.lastTs = performance.now();
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  pause() {
    this.paused = true;
    this.leftPressed = false;
    this.rightPressed = false;
  }

  resume() {
    if (!this.running) return;
    this.paused = false;
    this.lastTs = performance.now();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  destroy() {
    this.stop();
  }

  setLeft(v) {
    this.leftPressed = v;
    if (v) this.rightPressed = false;
  }
  setRight(v) {
    this.rightPressed = v;
    if (v) this.leftPressed = false;
  }
  resetInputs() {
    this.leftPressed = false;
    this.rightPressed = false;
  }

  spawnObject() {
    const diff = difficultyFor(this.score);
    const type = pickType(diff);
    const r = Math.max(16, this.W * 0.045);
    const x = r + Math.random() * (this.W - r * 2);
    const speedFrac = Math.min(0.78, 0.3 + diff * 0.46);
    const vy = this.H * speedFrac * (0.85 + Math.random() * 0.35);
    this.objects.push({
      type,
      x,
      y: -r,
      vy,
      r,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.6 + Math.random() * 0.8,
    });
  }

  addParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.6 + Math.random() * 0.4,
        max: 1,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  addSparkles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 30 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        life: 0.5 + Math.random() * 0.4,
        max: 1,
        color: "#fffde7",
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  addFloat(x, y, text, color) {
    this.floats.push({ x, y, text, color, life: 1, vy: -60 });
  }

  addRing(x, y, color) {
    this.rings.push({ x, y, r: 6, maxR: 48, life: 1, color });
  }

  catchObject(o) {
    const t = TYPES[o.type];
    if (t.positive) {
      this.combo += 1;
      if (this.combo > this.bestCombo) this.bestCombo = this.combo;
      this.score += t.points;
      this.caughtPositive += 1;
      this.basket.bounce = 1;
      const col = o.type === "modak" ? "#ffd54f" : o.type === "durva" ? "#9ccc65" : "#ffb74d";
      this.addParticles(o.x, o.y, col, 14);
      this.addRing(o.x, o.y, col);
      this.addFloat(o.x, o.y, `+${t.points}`, "#fffde7");
      if (o.type === "modak") this.addSparkles(o.x, o.y, 7);
      if (this.combo >= 3 && this.combo % 3 === 0) {
        this.addFloat(o.x, o.y - 22, `COMBO x${this.combo}!`, "#fff59d");
      }
      if (o.type === "modak") playCatchSound(this.combo);
      else playFlowerSound();
    } else {
      this.lives -= 1;
      this.combo = 0;
      this.wrongCaught += 1;
      this.shake = 1;
      this.flash = 1;
      this.addParticles(o.x, o.y, "#ef5350", 16);
      this.addRing(o.x, o.y, "#ef5350");
      this.addFloat(o.x, o.y, "-1 LIFE", "#ff8a80");
      playWrongSound();
      if (this.lives <= 0) {
        this.endGame();
        return;
      }
    }
    this.emitHud();
  }

  endGame() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.resetInputs();
    playGameOverSound();
    const accuracy =
      this.caughtPositive + this.wrongCaught === 0
        ? 0
        : Math.round((this.caughtPositive / (this.caughtPositive + this.wrongCaught)) * 100);
    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver({
        score: this.score,
        bestCombo: this.bestCombo,
        accuracy,
        livesRemaining: Math.max(0, this.lives),
      });
    }
  }

  drawBackground(ctx, now) {
    const W = this.W;
    const H = this.H;

    // floating petals (animated)
    ctx.save();
    for (const p of this.petals) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.rot, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // twinkling festival sparkles
    ctx.save();
    for (const s of this.sparkles) {
      const a = 0.25 + Math.abs(Math.sin(now * 0.002 * s.speed + s.phase)) * 0.45;
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff59d";
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // flickering diyas at bottom corners (alive accent over the scene)
    const glow = 0.55 + Math.sin(now * 0.003) * 0.18;
    drawDiya(ctx, 30, H - 26, 15, glow);
    drawDiya(ctx, W - 30, H - 26, 15, glow);
  }

  update(dt) {
    this.elapsed += dt;

    const speed = this.W * 1.25;
    if (this.leftPressed) this.basket.x -= speed * dt;
    if (this.rightPressed) this.basket.x += speed * dt;
    const half = this.basket.w / 2;
    this.basket.x = Math.max(half, Math.min(this.W - half, this.basket.x));

    // spawn frequency scales with difficulty (score)
    const diff = difficultyFor(this.score);
    const interval = Math.max(0.42, 0.95 - diff * 0.5);
    this.spawnAcc += dt;
    if (this.spawnAcc >= interval) {
      this.spawnAcc = 0;
      this.spawnObject();
    }

    const catchY = this.basket.y;
    const catchLeft = this.basket.x - this.basket.w * 0.42;
    const catchRight = this.basket.x + this.basket.w * 0.42;
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      o.y += o.vy * dt;
      o.rot += o.rotSpeed * dt;
      o.sway += o.swaySpeed * dt;
      o.x += Math.sin(o.sway) * 10 * dt;
      if (o.x < o.r) o.x = o.r;
      if (o.x > this.W - o.r) o.x = this.W - o.r;
      const bottom = o.y + o.r;
      const top = o.y - o.r;
      if (bottom >= catchY && top <= catchY + this.basket.h * 0.3) {
        if (o.x >= catchLeft && o.x <= catchRight) {
          this.catchObject(o);
          this.objects.splice(i, 1);
          continue;
        }
      }
      if (o.y - o.r > this.H + 20) {
        this.objects.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.life -= dt * 1.4;
      f.y += f.vy * dt;
      if (f.life <= 0) this.floats.splice(i, 1);
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.r += (ring.maxR - ring.r) * 0.2;
      ring.life -= dt * 2.2;
      if (ring.life <= 0) this.rings.splice(i, 1);
    }

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.5);
    if (this.basket) this.basket.bounce = Math.max(0, this.basket.bounce - dt * 4);

    for (const p of this.petals) {
      p.y += p.vy * dt;
      p.x += Math.sin(p.y * 0.01 + p.phase) * 6 * dt;
      p.rot += p.rotSpeed * dt;
      if (p.y > this.H + 10) {
        p.y = -10;
        p.x = Math.random() * this.W;
      }
    }
  }

  render(now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Festival illustrated background (cover-fit behind everything)
    if (bgImageLoaded && bgImage) {
      drawCover(ctx, bgImage, this.W, this.H);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, this.H);
      g.addColorStop(0, "#ffb74d");
      g.addColorStop(1, "#ff8a65");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.W, this.H);
    }
    // soft edge vignette for depth + object contrast (center stays clean)
    const vg = ctx.createRadialGradient(
      this.W / 2,
      this.H * 0.55,
      this.H * 0.2,
      this.W / 2,
      this.H * 0.5,
      this.H * 0.85
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(70,25,0,0.25)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.save();
    if (this.shake > 0) {
      const s = this.shake * 8;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }
    this.drawBackground(ctx, now);

    for (const o of this.objects) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(o.rot * 0.15);
      DRAWERS[o.type](ctx, o.r, now);
      ctx.restore();
    }

    // catch rings (expanding pop)
    for (const ring of this.rings) {
      ctx.globalAlpha = Math.max(0, ring.life) * 0.6;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // basket (with catch bounce)
    ctx.save();
    const b = this.basket.bounce || 0;
    ctx.translate(this.basket.x, this.basket.y);
    ctx.scale(1 + b * 0.12, 1 + b * 0.12);
    drawBasket(ctx, 0, 0, this.basket.w, this.basket.h);
    ctx.restore();

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const f of this.floats) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.font = `bold ${Math.max(14, this.W * 0.05)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(220,38,38,${this.flash * 0.28})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min((ts - this.lastTs) / 1000, 0.05);
    this.lastTs = ts;
    if (!this.paused) {
      this.update(dt);
    }
    this.render(ts);
    if (this.running) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }
}