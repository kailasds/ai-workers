// D major, 120 BPM, 60s product tour. Music and effects are one piece: every effect is tuned to the key,
// shares the reverb, and sits under the music.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 60.0, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const revIn = new Float32Array(N), dlyL = new Float32Array(N), dlyR = new Float32Array(N);
const TAU = Math.PI * 2;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7654321;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 * 2 - 1; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const inAny = (t, ranges) => ranges.some(([a, b]) => t >= a && t < b);

function add(i, v, pan = 0, rev = 0, dly = 0) {
  if (i < 0 || i >= N) return;
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  L[i] += v * gl; R[i] += v * gr;
  if (rev) revIn[i] += v * rev;
  if (dly) { dlyL[i] += v * dly * gl; dlyR[i] += v * dly * gr; }
}

// ---------------- arrangement ----------------
const DROP = 5.0, OUTRO = 55.0;
const DRUMS_FULL = [[8.5, 36.0], [43.0, 54.9]];
const BASS = [[DROP, 36.0], [43.0, 54.9]];
const LEAD = [[21.0, 35.0], [49.0, 54.9]];

const V = {
  D: { pad: [50, 57, 62, 66, 69], arp: [74, 78, 81, 86], root: 38 },
  Bm: { pad: [47, 54, 59, 62, 66], arp: [71, 74, 78, 83], root: 35 },
  G: { pad: [43, 50, 59, 62, 67], arp: [67, 71, 74, 79], root: 31 },
  A: { pad: [45, 52, 57, 61, 64], arp: [69, 73, 76, 81], root: 33 },
};
const chords = [[0, "D"], [2, "Bm"], [4, "A"]];
const bars = ["D", "A", "Bm", "G", "D", "A", "Bm", "G", "Bm", "G", "D", "A", "Bm", "G", "D", "A", "Bm", "G", "D", "A", "D", "A", "Bm", "G", "A"];
bars.forEach((c, k) => chords.push([DROP + k * 2, c]));
chords.push([OUTRO, "D"]);
const chordAt = (t) => { let c = chords[0][1]; for (const [s, n] of chords) if (t >= s) c = n; return c; };

// ---------------- pad ----------------
function renderPad() {
  for (let ci = 0; ci < chords.length; ci++) {
    const [start, name] = chords[ci];
    const end = ci + 1 < chords.length ? chords[ci + 1][0] : DUR;
    const a = Math.max(0, start - 0.05), b = Math.min(DUR, end + 0.45);
    for (const m of V[name].pad) {
      for (const det of [-0.07, 0.07]) {
        const f = mtof(m + det), ph0 = rnd() * TAU;
        for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) {
          const t = i / SR;
          const env = seg(t, a, a + 0.35) * (1 - seg(t, end, end + 0.45));
          const bright = seg(t, DROP - 0.2, DROP + 0.12) * (1 - 0.35 * seg(t, 58, 60));
          const introLift = 1 + 1.1 * (1 - seg(t, DROP - 0.3, DROP));
          const breakLift = 1 + 1.3 * (seg(t, 35.8, 36.3) - seg(t, 42.8, 43.2));
          const outroLift = 1 + 0.9 * seg(t, OUTRO - 0.1, OUTRO + 0.3);
          const fade = 1 - seg(t, 58.8, 60);
          const lfo = 1 + 0.08 * Math.sin(TAU * 0.23 * t + m);
          const ph = ph0 + TAU * f * t;
          let v = Math.sin(ph) + 0.35 * Math.sin(2 * ph);
          let br = 0;
          for (let h = 3; h <= 7; h++) br += Math.sin(h * ph) / Math.pow(h, 1.5);
          v += br * bright;
          add(i, v * env * introLift * breakLift * outroLift * fade * lfo * 0.018, det < 0 ? -0.45 : 0.45, 0.35);
        }
      }
    }
  }
}

// ---------------- plucks / arp / lead ----------------
function pluck(t0, m, amp, pan, rev = 0.25, dly = 0.3, decay = 0.17) {
  const f = mtof(m), s0 = Math.floor(t0 * SR), len = Math.floor(decay * 7 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, env = Math.min(1, t / 0.003) * Math.exp(-t / decay), ph = TAU * f * t;
    add(s0 + k, (Math.sin(ph) + 0.3 * Math.sin(2 * ph) * Math.exp(-t / 0.05) + 0.1 * Math.sin(3 * ph) * Math.exp(-t / 0.03)) * env * amp, pan, rev, dly);
  }
}
function bell(t0, m, amp, pan = 0, decay = 1.1, rev = 0.45) {
  const f = mtof(m), s0 = Math.floor(t0 * SR), len = Math.floor(decay * 5 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const v = Math.sin(TAU * f * t) * Math.exp(-t / decay) + 0.35 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / (decay * 0.5)) + 0.12 * Math.sin(TAU * f * 3.01 * t) * Math.exp(-t / (decay * 0.25));
    add(s0 + k, v * Math.min(1, t / 0.002) * amp, pan, rev, 0.12);
  }
}
function renderArp() {
  const pattern = [0, 1, 2, 3, 2, 1, 3, 1];
  for (let k = 0; ; k++) {
    const t = k * 0.25;
    if (t >= 59.0) break;
    const c = V[chordAt(t + 0.001)];
    const accent = k % 2 === 0 ? 1 : 0.72;
    const introLift = 1 + 0.5 * (1 - seg(t, DROP - 0.3, DROP));
    const breakdown = inAny(t, [[36, 43]]) ? 1.25 : 1;
    const level = introLift * breakdown * (1 - 0.6 * seg(t, 56, 59));
    pluck(t, c.arp[pattern[k % 8]], 0.066 * accent * level, k % 2 ? 0.35 : -0.35, 0.2, 0.32);
  }
}
function renderLead() {
  for (let k = 0; k < bars.length; k++) {
    const t = DROP + k * 2;
    if (!inAny(t, LEAD)) continue;
    const a = V[bars[k]].arp;
    [[0, a[2]], [0.5, a[1]], [1.0, a[3]], [1.5, a[2]]].forEach(([o, m], i) => bell(t + o, m + 12, i === 2 ? 0.03 : 0.022, 0.15, 0.45, 0.4));
  }
}

// ---------------- drums & bass ----------------
function kick(t0, amp) {
  const s0 = Math.floor(t0 * SR); let ph = 0;
  for (let k = 0; k < SR * 0.5; k++) {
    const t = k / SR; ph += TAU * (44 + 86 * Math.exp(-t / 0.028)) / SR;
    add(s0 + k, (Math.sin(ph) * Math.exp(-t / 0.26) + (k < 90 ? rnd() * 0.12 * (1 - k / 90) : 0)) * amp, 0, 0.02);
  }
}
function noiseHit(t0, amp, decay, pan, hp = true, rev = 0.05, len = 0.25) {
  const s0 = Math.floor(t0 * SR); let lp = 0;
  for (let k = 0; k < SR * len; k++) { const n = rnd(); lp += 0.25 * (n - lp); add(s0 + k, (hp ? n - lp : lp) * Math.exp(-(k / SR) / decay) * amp, pan, rev); }
}
function clap(t0, amp) {
  for (const o of [0, 0.011, 0.022]) {
    const s0 = Math.floor((t0 + o) * SR); let a = 0, b = 0;
    for (let k = 0; k < SR * 0.2; k++) { const n = rnd(); a += 0.35 * (n - a); b += 0.35 * (a - b); add(s0 + k, (a - b) * Math.exp(-(k / SR) / (o === 0.022 ? 0.09 : 0.012)) * amp, 0.05, 0.22); }
  }
}
function renderDrums() {
  for (let b = 0; ; b++) {
    const t = DROP + b * 0.5;
    if (t > 54.6) break;
    const full = inAny(t, DRUMS_FULL);
    if (t < 8.5 && b % 2 === 0) kick(t, 0.5);
    if (full) { const reentry = t >= 43 ? 0.5 + 0.5 * seg(t, 43, 44.5) : 1; kick(t, 0.5 * reentry); if (b % 2 === 1) clap(t, 0.16 * reentry); }
    if (full || inAny(t, [[36, 43]])) noiseHit(t + 0.25, full ? 0.05 : 0.05, 0.028, 0.3, true, 0.02, 0.12);
  }
}
function renderBass() {
  let ph = 0;
  for (let i = Math.floor(DROP * SR); i < Math.floor(54.9 * SR); i++) {
    const t = i / SR;
    if (!inAny(t, BASS)) continue;
    ph += TAU * mtof(V[chordAt(t)].root + 12) / SR;
    const duck = 0.35 + 0.65 * seg(((t - DROP) % 0.5) / 0.5, 0, 0.45);
    const env = inAny(t, [[DROP, 5.02], [43.0, 43.02]]) ? seg(t, Math.floor(t), Math.floor(t) + 0.02) : 1;
    add(i, (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * duck * env * (1 - seg(t, 35.85, 36.0)) * (1 - seg(t, 54.75, 54.9)) * 0.17, 0);
  }
}

// ---------------- transitions / sfx ----------------
function svfSweep(t0, dur, f0, f1, amp, env, pan0 = 0, pan1 = 0, rev = 0.3, Q = 2.2) {
  const s0 = Math.floor(t0 * SR), n = Math.floor(dur * SR); let low = 0, band = 0;
  for (let k = 0; k < n; k++) {
    const p = k / n, fc = f0 * Math.pow(f1 / f0, p), f = 2 * Math.sin(Math.PI * fc / SR);
    const hi = rnd() - low - band / Q; band += f * hi; low += f * band;
    add(s0 + k, band * env(p) * amp, pan0 + (pan1 - pan0) * p, rev);
  }
}
const whoosh = (tc, amp = 0.12) => svfSweep(tc - 0.2, 0.55, 2600, 500, amp, (p) => Math.sin(Math.PI * Math.pow(p, 0.8)) ** 2, -0.5, 0.5, 0.35);
function pulse(t0, amp) {
  const s0 = Math.floor(t0 * SR); let ph = 0;
  for (let k = 0; k < SR * 0.45; k++) { const t = k / SR; ph += TAU * (55 + 18 * Math.exp(-t / 0.05)) / SR; add(s0 + k, Math.sin(ph) * Math.min(1, t / 0.008) * Math.exp(-t / 0.2) * amp, 0, 0.05); }
}
function impact(t0, amp) {
  const s0 = Math.floor(t0 * SR); let ph = 0;
  for (let k = 0; k < SR * 1.2; k++) { const t = k / SR; ph += TAU * (40 + 25 * Math.exp(-t / 0.08)) / SR; add(s0 + k, Math.sin(ph) * Math.exp(-t / 0.45) * amp, 0, 0.1); }
  svfSweep(t0, 1.3, 5000, 1500, 0.05, (p) => Math.exp(-p * 4), -0.4, 0.4, 0.6, 1.2);
}
function click(t0) {
  noiseHit(t0, 0.05, 0.004, 0.1, true, 0.05, 0.02);
  const s0 = Math.floor(t0 * SR);
  for (let k = 0; k < SR * 0.05; k++) add(s0 + k, Math.sin(TAU * mtof(93) * k / SR) * Math.exp(-(k / SR) / 0.012) * 0.03, 0.1, 0.1);
}
function renderSfx() {
  for (let t = 1.0; t < 4.9; t += 0.5) pulse(t, (Math.round(t * 2) % 2 === 0 ? 0.14 : 0.08) * (0.7 + 0.3 * seg(t, 1, 4.5)));
  [[0.2, 74], [0.85, 78], [1.5, 81], [2.15, 86]].forEach(([t, m], i) => bell(t + 0.1, m, 0.05, -0.3 + i * 0.2, 0.55));
  svfSweep(3.3, 1.7, 300, 4200, 0.07, (p) => Math.pow(p, 2.2), -0.2, 0.2, 0.3, 3);
  impact(DROP, 0.12);
  [8.45, 20.0, 23.0, 26.0, 31.0, 36.0, 42.5, 49.0, 55.0].forEach((t) => whoosh(t));
  // Compose steps advancing: quiet in-key ticks rather than full whooshes
  [[10.13, 76], [11.83, 78], [14.13, 81], [14.98, 83], [15.88, 86]].forEach(([t, m]) => pluck(t, m, 0.03, 0.2, 0.35, 0.15, 0.12));
  [9.58, 15.62, 16.7, 18.42, 27.55, 43.62, 44.92, 50.95].forEach(click);
  [74, 78, 81, 86, 90].forEach((m, i) => pluck(18.62 + i * 0.12, m, 0.025, -0.2 + i * 0.1, 0.35, 0.15, 0.14)); // building
  [86, 90, 93].forEach((m, i) => bell(19.22 + i * 0.075, m, 0.045, -0.2 + i * 0.2, 1.1));                     // package ready
  pluck(27.6, 81, 0.045, -0.1, 0.35, 0.2, 0.16); pluck(27.65, 88, 0.035, 0.15, 0.35, 0.2, 0.16);                // popover
  [[37.05, 81], [37.55, 83], [38.05, 86], [38.55, 90]].forEach(([t, m], i) => pluck(t, m, 0.04, -0.25 + i * 0.15, 0.35, 0.2, 0.12));
  svfSweep(41.3, 1.7, 300, 4000, 0.06, (p) => Math.pow(p, 2.2), -0.2, 0.2, 0.3, 3);                              // back into the groove
  impact(43.0, 0.04);
  [86, 90, 93].forEach((m, i) => bell(44.97 + i * 0.075, m, 0.045, -0.2 + i * 0.2, 1.1));                     // certified
  pluck(51.4, 78, 0.035, 0, 0.35, 0.2, 0.16);
  [74, 81, 86].forEach((m, i) => bell(OUTRO + 0.05 + i * 0.04, m, 0.05, -0.25 + i * 0.25, 1.6));
  [74, 78, 81, 86].forEach((m, i) => pluck(OUTRO + 0.14 + i * 0.16, m, 0.035, -0.3 + i * 0.2, 0.4, 0.15, 0.2));
}

renderPad(); renderArp(); renderLead(); renderDrums(); renderBass(); renderSfx();

// ping-pong delay (dotted eighth)
{
  const d = Math.floor(0.375 * SR), fb = 0.32, bl = new Float32Array(N), br = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    bl[i] = dlyL[i] + (i >= d ? br[i - d] * fb : 0); br[i] = dlyR[i] + (i >= d ? bl[i - d] * fb : 0);
    if (i >= d) { L[i] += bl[i - d] * 0.55; R[i] += br[i - d] * 0.55; revIn[i] += (bl[i - d] + br[i - d]) * 0.1; }
  }
}
// freeverb-style reverb
{
  const scale = SR / 44100;
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((x) => Math.floor(x * scale));
  const apT = [556, 441, 341, 225].map((x) => Math.floor(x * scale));
  const run = (spread) => {
    const out = new Float32Array(N);
    const combs = combT.map((n) => ({ buf: new Float32Array(n + spread), i: 0, store: 0 }));
    const aps = apT.map((n) => ({ buf: new Float32Array(n + spread), i: 0 }));
    for (let s = 0; s < N; s++) {
      const x = revIn[s] * 0.015; let acc = 0;
      for (const c of combs) { const y = c.buf[c.i]; c.store = y * 0.7 + c.store * 0.3; c.buf[c.i] = x + c.store * 0.84; c.i = (c.i + 1) % c.buf.length; acc += y; }
      for (const a of aps) { const b = a.buf[a.i]; const y = -acc + b; a.buf[a.i] = acc + b * 0.5; a.i = (a.i + 1) % a.buf.length; acc = y; }
      out[s] = acc;
    }
    return out;
  };
  const rl = run(0), rr = run(23);
  for (let i = 0; i < N; i++) { L[i] += rl[i] * 0.9; R[i] += rr[i] * 0.9; }
}
// master
{
  let pl = 0, pr = 0, peak = 0; const a = 1 - Math.exp(-TAU * 13000 / SR);
  for (let i = 0; i < N; i++) {
    pl += a * (L[i] - pl); pr += a * (R[i] - pr);
    const g = (1 - seg(i / SR, 59.1, 60.0) ** 1.5) * seg(i / SR, 0, 0.02);
    L[i] = Math.tanh(pl * 1.2) * g; R[i] = Math.tanh(pr * 1.2) * g;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const g = Math.pow(10, -1 / 20) / peak;
  for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
}
{
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(clamp(L[i], -1, 1) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(clamp(R[i], -1, 1) * 32767), 46 + i * 4); }
  fs.writeFileSync(path.join(DIR, "audio.wav"), buf);
  console.log("wrote audio.wav");
}
