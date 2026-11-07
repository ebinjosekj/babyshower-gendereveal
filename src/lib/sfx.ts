// Sound effects for the invitation's animations. Everything is synthesised live with the Web Audio API (no audio files, nothing
// to license): soft bells, airy whooshes, thumps and shimmers in a pentatonic key so every sound sits nicely under the
// background music and with each other. Browsers only allow sound after a tap, so cues that fire earlier are queued and the
// ones still ahead of the clock play the moment the guest unlocks sound.

export type SfxName =
  | 'comet' | 'impact' | 'ping1' | 'ping2' | 'spin' | 'settle' | 'pip' | 'stamp' | 'starPass' | 'pillHit' | 'toSeal' | 'merge'
  | 'charge' | 'crack' | 'flap' | 'leak' | 'swell' | 'ringPing' | 'twinkle' | 'release' | 'bloom' | 'landing'
  | 'scratch' | 'scratchDone' | 'tap' | 'chime' | 'diamond' | 'cue' | 'swish' | 'pop' | 'success' | 'heroPill' | 'heroNames' | 'heroTwin' | 'heroCue' | 'whoosh';

interface Opt { i?: number; side?: number; dur?: number }

let ctx: AudioContext | null = null;
let master: GainNode;
let bus: GainNode;
let send: GainNode;
let noiseBuf: AudioBuffer;
const MUTE_KEY = 'baby-shower-sound-muted';
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();
let unlocked = false;
const last: Record<string, number> = {};
let queue: { at: number; name: SfxName; opt?: Opt }[] = [];
const listeners = new Set<() => void>();
const watchers = new Set<() => void>();
const emit = () => watchers.forEach((w) => w());

const PENT = [0, 2, 4, 7, 9];
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
// i-th note of a C-major pentatonic scale starting at midi `base`
const pent = (i: number, base = 72) => mtof(base + PENT[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function build(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const c = new AC();
  ctx = c;
  master = c.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 24;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;
  master.connect(comp);
  comp.connect(c.destination);
  // a soft, dark hall so the bells bloom instead of clicking
  const len = Math.floor(c.sampleRate * 2.6);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * (i < 1200 ? i / 1200 : 1);
  }
  const conv = c.createConvolver();
  conv.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.34;
  conv.connect(wet);
  wet.connect(master);
  send = c.createGain();
  send.gain.value = 1;
  send.connect(conv);
  noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  newBus();
  return c;
}

function newBus() {
  if (!ctx) return;
  bus = ctx.createGain();
  bus.connect(master);
  const s = ctx.createGain();
  s.gain.value = 0.4;
  bus.connect(s);
  s.connect(send);
}

// ---------- building blocks ----------
function pan(v: number): AudioNode {
  const c = ctx!;
  if (!c.createStereoPanner) return bus;
  const p = c.createStereoPanner();
  p.pan.value = v;
  p.connect(bus);
  return p;
}

function bell(t: number, f: number, vel: number, decay = 1.8, out: AudioNode = bus) {
  const c = ctx!;
  const parts: [number, number, number][] = [[1, 1, 1], [2.76, 0.42, 0.55], [5.4, 0.2, 0.3], [8.93, 0.1, 0.18]];
  for (const [r, g, d] of parts) {
    if (f * r > 14000) continue;
    const o = c.createOscillator();
    const e = c.createGain();
    o.type = 'sine';
    o.frequency.value = f * r;
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(vel * g, t + 0.006);
    e.gain.exponentialRampToValueAtTime(0.0001, t + decay * d);
    o.connect(e);
    e.connect(out);
    o.start(t);
    o.stop(t + decay * d + 0.05);
  }
}

function noiseSrc(t: number, dur: number, off = rnd(0, 0.5)) {
  const s = ctx!.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  s.start(t, off);
  s.stop(t + dur + 0.05);
  return s;
}

// airy sweep: band-passed noise gliding f0 → f1 with a swelling envelope
function whoosh(t: number, dur: number, f0: number, f1: number, vel: number, q = 1.2, out: AudioNode = bus, peak = 0.4) {
  const c = ctx!;
  const n = noiseSrc(t, dur);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vel * 3.4, t + dur * peak); // band-passed noise is much quieter than a tone: lift it to sit with the bells
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(bp);
  bp.connect(g);
  g.connect(out);
}

function thump(t: number, f0: number, f1: number, dur: number, vel: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vel, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function click(t: number, vel: number, hp = 2500, dur = 0.05) {
  const c = ctx!;
  const n = noiseSrc(t, dur);
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(vel, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f);
  f.connect(g);
  g.connect(bus);
}

function glide(t: number, f0: number, f1: number, dur: number, vel: number, out: AudioNode = bus, type: OscillatorType = 'sine') {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// a sprinkle of tiny high bells
function shimmer(t: number, dur: number, n: number, vel: number, lo = 10, hi = 17) {
  for (let k = 0; k < n; k++) bell(t + rnd(0, dur), pent(Math.floor(rnd(lo, hi))), vel * rnd(0.5, 1), rnd(0.5, 1.1));
}

// a rising pad + hiss that builds toward a moment
function riser(t: number, dur: number, vel: number) {
  const c = ctx!;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 2;
  lp.frequency.setValueAtTime(260, t);
  lp.frequency.exponentialRampToValueAtTime(5200, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.92);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
  lp.connect(g);
  g.connect(bus);
  [0, 7, 12].forEach((semi, i) => {
    const o = c.createOscillator();
    o.type = i === 1 ? 'triangle' : 'sawtooth';
    o.detune.value = (i - 1) * 7;
    o.frequency.setValueAtTime(mtof(48 + semi), t);
    o.frequency.exponentialRampToValueAtTime(mtof(60 + semi), t + dur);
    o.connect(lp);
    o.start(t);
    o.stop(t + dur + 0.3);
  });
  whoosh(t, dur + 0.1, 1200, 7000, vel * 0.35, 0.8, bus, 0.9);
}

// a soft plucked-harp note
function pluck(t: number, f: number, vel: number, decay = 1.1, out: AudioNode = bus) {
  const c = ctx!;
  [[1, 1, 'triangle'], [2, 0.3, 'sine']].forEach(([r, g, ty]) => {
    const o = c.createOscillator();
    const e = c.createGain();
    o.type = ty as OscillatorType;
    o.frequency.value = f * (r as number);
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(vel * (g as number), t + 0.008);
    e.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(e);
    e.connect(out);
    o.start(t);
    o.stop(t + decay + 0.05);
  });
}
// a run of plucked notes (midi list), `step` seconds apart
function arp(t: number, notes: number[], step: number, vel: number, decay = 1.1) {
  notes.forEach((m, i) => pluck(t + i * step, mtof(m), vel, decay));
}

function chord(t: number, notes: number[], vel: number, decay: number) {
  notes.forEach((m, i) => bell(t + i * 0.03, mtof(m), vel, decay));
}

// ---------- the sounds ----------
const VOICES: Record<SfxName, (t: number, o: Opt) => void> = {
  comet: (t) => {
    glide(t, 3000, 520, 1.45, 0.05);
    whoosh(t, 1.5, 5200, 900, 0.1, 1.6, bus, 0.55);
    for (let k = 0; k < 6; k++) bell(t + 0.2 + k * 0.2, pent(15 - k), 0.025, 0.5);
  },
  impact: (t) => {
    thump(t, 95, 38, 0.7, 0.4);
    chord(t, [72, 76, 79, 84], 0.17, 3);
    shimmer(t + 0.05, 1.4, 14, 0.07);
    click(t, 0.09, 4000, 0.08);
    arp(t + 0.1, [72, 76, 79, 84, 88, 91], 0.1, 0.1, 1.6);
  },
  ping1: (t) => bell(t, pent(10), 0.2, 1.6),
  ping2: (t) => bell(t, pent(13), 0.17, 1.6),
  spin: (t) => {
    whoosh(t, 1.35, 260, 2600, 0.22, 0.9, bus, 0.55);
    whoosh(t + 0.35, 1.0, 3200, 700, 0.1, 1.4, bus, 0.4);
    glide(t, 220, 440, 1.2, 0.035);
    arp(t + 0.1, [72, 74, 76, 79, 81, 84, 86, 88], 0.14, 0.09, 1.2);
  },
  settle: (t) => {
    thump(t, 110, 50, 0.3, 0.14);
    bell(t + 0.02, pent(5, 60), 0.1, 1.2);
    click(t, 0.025, 1800, 0.06);
  },
  pip: (t, o) => bell(t, pent(o.i ?? 0, 72), 0.14, 1.0),
  stamp: (t) => {
    thump(t, 150, 44, 0.32, 0.42);
    click(t, 0.16, 1400, 0.06);
    bell(t + 0.02, mtof(52), 0.12, 1.4);
    bell(t + 0.07, pent(9), 0.08, 1.0);
    arp(t + 0.12, [48, 55, 60, 64], 0.06, 0.08, 1.4);
  },
  starPass: (t, o) => {
    const s = o.side ?? 1;
    const d = o.dur ?? 2.1;
    const c = ctx!;
    const p = c.createStereoPanner ? c.createStereoPanner() : null;
    let out: AudioNode = bus;
    if (p) {
      p.pan.setValueAtTime(-0.85 * s, t);
      p.pan.linearRampToValueAtTime(0.85 * s, t + d * 0.5);
      p.pan.linearRampToValueAtTime(-0.4 * s, t + d);
      p.connect(bus);
      out = p;
    }
    whoosh(t, d, s > 0 ? 1500 : 1100, s > 0 ? 3600 : 2800, 0.1, 3.5, out, 0.45);
    glide(t, s > 0 ? 1320 : 990, s > 0 ? 1980 : 1480, d, 0.022, out);
    // a little tune follows each star round the envelope: blue climbs, pink answers by falling
    for (let k = 0; k < 10; k++) pluck(t + (k / 10) * d, pent(s > 0 ? 8 + k : 17 - k, 72), 0.045, 0.9, out);
  },
  pillHit: (t) => {
    bell(t, pent(7), 0.2, 1.5);
    bell(t + 0.07, pent(9), 0.12, 1.2);
    click(t, 0.06, 3200, 0.04);
  },
  toSeal: (t) => {
    const d = 1.3;
    glide(t, 880, 1320, d, 0.04, pan(-0.5));
    glide(t, 1040, 1320, d, 0.04, pan(0.5));
    whoosh(t, d, 800, 2400, 0.09, 1.8, bus, 0.7);
  },
  merge: (t) => {
    thump(t, 80, 40, 0.5, 0.3);
    chord(t, [72, 79, 88], 0.17, 2.6);
    glide(t, 1800, 6200, 0.35, 0.03);
    shimmer(t + 0.05, 1.1, 12, 0.07);
    click(t, 0.08, 3800, 0.06);
    arp(t + 0.05, [79, 84, 88, 91, 96], 0.07, 0.08, 1.6);
  },
  charge: (t) => {
    glide(t, 98, 196, 1.1, 0.12, bus, 'triangle');
    glide(t, 196, 392, 1.1, 0.05);
    whoosh(t, 1.1, 300, 1500, 0.06, 1, bus, 0.9);
  },
  crack: (t) => {
    click(t, 0.3, 1800, 0.07);
    thump(t, 210, 70, 0.2, 0.3);
    bell(t + 0.03, pent(14), 0.1, 0.8);
    bell(t + 0.08, pent(16), 0.08, 0.7);
    for (let k = 0; k < 5; k++) click(t + 0.05 + k * 0.045, 0.1, 3500, 0.02);
  },
  flap: (t) => {
    const d = 1.4;
    whoosh(t, d, 700, 2300, 0.2, 0.7, bus, 0.45);
    const c = ctx!;
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 17;
    lg.gain.value = 0.04;
    const g = c.createGain();
    g.gain.value = 0.05;
    lfo.connect(lg);
    lg.connect(g.gain);
    const n = noiseSrc(t, d);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    n.connect(hp);
    hp.connect(g);
    g.connect(bus);
    lfo.start(t);
    lfo.stop(t + d);
    glide(t + 0.1, 150, 260, 0.9, 0.05, bus, 'triangle');
  },
  leak: (t) => {
    shimmer(t, 1.3, 7, 0.045, 12, 18);
    glide(t, 1200, 2400, 1.3, 0.016);
  },
  swell: (t, o) => {
    const d = o.dur ?? 3.7;
    riser(t, d, 0.2);
    // a rising harp figure under the swell, climbing to the bloom
    const n = Math.floor(d / 0.3);
    for (let k = 0; k < n; k++) pluck(t + k * 0.3, pent(k % 10 + Math.floor(k / 4), 60), 0.03 + 0.07 * (k / n), 1.0);
  },
  ringPing: (t, o) => {
    bell(t, pent((o.i ?? 0) + 3, 72), 0.14, 1.5);
    glide(t, 700, 1500, 0.4, 0.018);
  },
  twinkle: (t) => bell(t, pent(Math.floor(rnd(13, 19))), 0.05, 0.7),
  release: (t) => {
    whoosh(t, 1.1, 420, 3200, 0.2, 0.9, bus, 0.5);
    thump(t, 70, 36, 0.5, 0.3);
    chord(t + 0.05, [67, 74, 79], 0.1, 2.2);
  },
  bloom: (t) => {
    thump(t, 70, 34, 1.1, 0.42);
    chord(t, [60, 67, 72, 76, 84], 0.19, 4.2);
    [16, 14, 12].forEach((n, i) => bell(t + i * 0.26, pent(n), 0.2, 1.8));
    whoosh(t, 1.6, 6000, 1500, 0.07, 0.7, bus, 0.15);
    shimmer(t + 0.1, 2.2, 22, 0.08);
    arp(t + 0.2, [76, 79, 83, 84, 88, 91, 95, 96], 0.15, 0.1, 2.2);
  },
  landing: (t) => {
    shimmer(t, 1.8, 22, 0.06);
    chord(t, [64, 71, 76, 83], 0.11, 3.4);
    glide(t, 900, 3600, 0.9, 0.025);
    // the lullaby's opening phrase, as a soft goodbye to the envelope
    arp(t + 0.3, [76, 79, 76, 74, 72], 0.42, 0.11, 1.8);
  },
  scratch: (t, o) => {
    // a tiny grain of foil rasp: louder and brighter the faster the finger moves
    const sp = Math.min(40, o.dur ?? 10);
    const c = ctx!;
    const n = noiseSrc(t, 0.09);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.3;
    bp.frequency.value = rnd(2600, 5200) + sp * 30;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = c.createGain();
    const v = 0.1 + sp * 0.006;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    n.connect(bp);
    bp.connect(hp);
    hp.connect(g);
    g.connect(bus);
    if (Math.random() < 0.22) bell(t, pent(Math.floor(rnd(14, 20))), 0.025, 0.5);
  },
  scratchDone: (t) => {
    // the foil is cleared: a bright reveal
    whoosh(t, 0.7, 900, 4200, 0.12, 0.9, bus, 0.35);
    chord(t + 0.05, [72, 79, 84, 88], 0.16, 2.6);
    arp(t + 0.1, [79, 84, 88, 91, 96], 0.07, 0.08, 1.6);
    shimmer(t + 0.1, 1.2, 14, 0.06);
  },
  tap: (t) => {
    bell(t, 1760, 0.1, 0.5);
    click(t, 0.04, 4500, 0.025);
  },
  chime: (t, o) => {
    bell(t, pent(o.i ?? 8, 72), 0.16, 1.4);
    bell(t + 0.09, pent((o.i ?? 8) + 2, 72), 0.1, 1.2);
  },
  diamond: (t) => {
    bell(t, pent(12), 0.12, 1.3);
    shimmer(t, 0.5, 4, 0.04);
  },
  cue: (t) => bell(t, pent(9), 0.08, 1.2),
  swish: (t) => {
    whoosh(t, 0.75, 500, 1900, 0.09, 0.9, bus, 0.4);
    arp(t + 0.1, [79, 83, 86], 0.12, 0.05, 1.0);
  },
  whoosh: (t) => whoosh(t, 0.8, 400, 2200, 0.13, 0.9, bus, 0.45),
  pop: (t) => {
    click(t, 0.2, 1200, 0.07);
    thump(t, 260, 90, 0.14, 0.25);
    for (let k = 0; k < 6; k++) bell(t + 0.02 + k * 0.045, pent(Math.floor(rnd(9, 17))), 0.07, 0.8);
    shimmer(t + 0.1, 0.9, 8, 0.045);
    arp(t + 0.05, [76, 79, 83, 88], 0.06, 0.07, 1.0);
  },
  success: (t) => {
    [9, 11, 12, 14, 16].forEach((n, i) => bell(t + i * 0.085, pent(n), 0.15, 1.8));
    shimmer(t + 0.2, 1.3, 12, 0.06);
  },
  heroPill: (t) => {
    bell(t, pent(7), 0.12, 1.2);
    glide(t, 800, 1600, 0.3, 0.02);
  },
  heroNames: (t) => {
    bell(t, mtof(64), 0.17, 2.4);
    bell(t + 0.16, mtof(71), 0.15, 2.4);
    bell(t + 0.3, mtof(76), 0.13, 2.6);
    arp(t + 0.35, [76, 79, 76, 74, 72], 0.26, 0.07, 1.6);
    whoosh(t, 0.9, 700, 2600, 0.07, 0.9, bus, 0.5);
  },
  heroTwin: (t) => {
    bell(t, mtof(88), 0.09, 1.2);
    bell(t + 0.14, mtof(91), 0.09, 1.2);
  },
  heroCue: (t) => bell(t, pent(9), 0.09, 1.3),
};


// ---------- public api ----------
const MIN_GAP: Partial<Record<SfxName, number>> = { scratch: 48, pip: 450, tap: 90, chime: 700, diamond: 500, cue: 600, swish: 500, pop: 250, twinkle: 40 };

function fire(name: SfxName, delayMs: number, opt: Opt = {}) {
  if (!ctx || ctx.state !== 'running') return;
  const gap = MIN_GAP[name];
  const now = performance.now();
  if (gap && delayMs === 0) {
    if (now - (last[name] ?? -1e9) < gap) return;
    last[name] = now;
  }
  try {
    VOICES[name](ctx.currentTime + 0.03 + delayMs / 1000, opt);
  } catch {
    /* an unsupported node on an old browser: stay silent rather than break the page */
  }
}

export const sfx = {
  /** Unlock sound (call from a tap / key press). Safe to call many times. */
  unlock() {
    const c = build();
    if (!c) return;
    unlocked = true;
    const done = () => {
      // iOS needs a (silent) sound started inside the gesture
      try {
        const b = c.createBuffer(1, 1, 22050);
        const s = c.createBufferSource();
        s.buffer = b;
        s.connect(c.destination);
        s.start(0);
      } catch {
        /* ignore */
      }
      flush();
      listeners.forEach((l) => l());
      emit();
    };
    if (c.state === 'running') done();
    else void c.resume().then(done, () => undefined);
  },
  /** Create the context without a gesture; some browsers (desktop, returning visitors) let it run straight away. */
  tryAuto() {
    const c = build();
    if (c && c.state === 'running') unlocked = true;
    return !!c && c.state === 'running';
  },
  running: () => !!ctx && ctx.state === 'running',
  onUnlock(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setMuted(m: boolean) {
    muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      /* private mode */
    }
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
    emit();
  },
  isMuted: () => muted,
  /** Re-run `fn` whenever sound is unlocked or muted/unmuted (for the buttons). */
  subscribe(fn: () => void) {
    watchers.add(fn);
    return () => {
      watchers.delete(fn);
    };
  },
  /** Play now (or `delayMs` from now). */
  play(name: SfxName, delayMs = 0, opt?: Opt) {
    fire(name, delayMs, opt);
  },
  /** Schedule a cue on a timeline: if sound is not unlocked yet it is queued and plays only if still ahead when unlocked. */
  cue(name: SfxName, delayMs: number, opt?: Opt) {
    if (ctx && ctx.state === 'running') fire(name, delayMs, opt);
    else queue.push({ at: performance.now() + delayMs, name, opt });
  },
  /** Drop queued cues and fade out anything already scheduled (skip, replay). */
  stopScheduled() {
    queue = [];
    if (!ctx) return;
    const old = bus;
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
    newBus();
  },
  clearQueue() {
    queue = [];
  },
  unlockedOnce: () => unlocked,
};

function flush() {
  if (!ctx || ctx.state !== 'running') return;
  const now = performance.now();
  const q = queue;
  queue = [];
  for (const c of q) if (c.at > now - 30) fire(c.name, Math.max(0, c.at - now), c.opt);
}
