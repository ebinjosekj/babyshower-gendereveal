// Sound effects for the invitation's animations. Everything is synthesised live with the Web Audio API (no audio files, nothing
// to license): soft felt-piano notes, breathy swells, pillow thumps and water-drop taps in a pentatonic key so every sound is gentle and sits
// well with the others. Browsers only allow sound after a tap, so cues that fire earlier are queued and the
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
let muted = false; // sound starts ON every visit; the button mutes/unmutes
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

// ---------- building blocks (soft: rounded, low-passed, slow attacks) ----------
function noiseSrc(t: number, dur: number, off = rnd(0, 0.5)) {
  const s = ctx!.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  s.start(t, off);
  s.stop(t + dur + 0.05);
  return s;
}

function lowpass(f: number, q = 0.5) {
  const l = ctx!.createBiquadFilter();
  l.type = 'lowpass';
  l.frequency.value = f;
  l.Q.value = q;
  return l;
}

function envG(t: number, pk: number, a: number, dur: number) {
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pk, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}

// i-th note (midi) of a C-major pentatonic scale from `base`
const pm = (i: number, base = 72) => base + PENT[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);

// soft felt-piano / celesta note (midi)
function key(t: number, m: number, v = 0.12, dur = 1.5, out: AudioNode = bus) {
  const c = ctx!;
  const f = mtof(m);
  const l = lowpass(Math.min(2200, f * 3));
  const g = envG(t, v, 0.02, dur);
  for (const [r, a] of [[1, 1], [2, 0.2], [3, 0.05]]) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.frequency.value = f * r;
    og.gain.value = a;
    o.connect(og);
    og.connect(l);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  l.connect(g);
  g.connect(out);
}

// warm slow chord
function pad(t: number, notes: number[], dur = 2, v = 0.05) {
  const c = ctx!;
  for (const m of notes)
    for (const dt of [-5, 5]) {
      const o = c.createOscillator();
      const l = lowpass(900);
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = mtof(m);
      o.detune.value = dt;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(l);
      l.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
}

// breathy swell of low-passed air
function breath(t: number, dur: number, f0: number, f1: number, v = 0.12, out: AudioNode = bus) {
  const c = ctx!;
  const n = noiseSrc(t, dur);
  const b = c.createBiquadFilter();
  b.type = 'bandpass';
  b.Q.value = 0.5;
  b.frequency.setValueAtTime(f0, t);
  b.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(b);
  b.connect(g);
  g.connect(out);
}

// pillowy low thump
function pillow(t: number, f = 75, v = 0.5, dur = 0.35) {
  const c = ctx!;
  const o = c.createOscillator();
  const l = lowpass(260);
  const g = envG(t, v, 0.015, dur);
  o.frequency.setValueAtTime(f * 1.4, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
  o.connect(l);
  l.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// water-droplet tap
function drop(t: number, f = 700, v = 0.2) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = envG(t, v, 0.008, 0.2);
  o.frequency.setValueAtTime(f * 1.35, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.25);
}

// a soft low-passed grain (scratch)
function grain(t: number, v = 0.05) {
  const c = ctx!;
  const n = noiseSrc(t, 0.09);
  const b = c.createBiquadFilter();
  b.type = 'bandpass';
  b.frequency.value = rnd(1400, 2600);
  b.Q.value = 0.8;
  const g = envG(t, v, 0.012, 0.09);
  n.connect(b);
  b.connect(g);
  g.connect(bus);
}

function sprinkle(t: number, dur: number, n: number, v = 0.04) {
  for (let i = 0; i < n; i++) drop(t + Math.pow(Math.random(), 1.2) * dur, rnd(900, 1800), v);
}

// soft high twinkles
function twinkles(t: number, dur: number, n: number, v = 0.04, lo = 10, hi = 17) {
  for (let k = 0; k < n; k++) key(t + rnd(0, dur), pm(Math.floor(rnd(lo, hi))), v * rnd(0.6, 1), rnd(0.8, 1.3));
}

function run(t: number, notes: number[], step: number, v: number, dur = 1.4) {
  notes.forEach((m, i) => key(t + i * step, m, v, dur));
}

// ---------- the sounds ----------
const VOICES: Record<SfxName, (t: number, o: Opt) => void> = {
  comet: (t) => {
    breath(t, 1.6, 1800, 300, 0.16);
    run(t + 0.2, [88, 84, 79, 76], 0.3, 0.07, 1.2);
  },
  impact: (t) => {
    pillow(t, 70, 0.5);
    pad(t + 0.05, [60, 67, 72], 2, 0.05);
    run(t + 0.3, [72, 76, 79, 84], 0.2, 0.06, 1.6);
  },
  ping1: (t) => key(t, 79, 0.12, 1.3),
  ping2: (t) => key(t, 84, 0.1, 1.3),
  spin: (t) => {
    breath(t, 1.35, 300, 1800, 0.14);
    run(t + 0.1, [72, 74, 76, 79, 81, 84], 0.2, 0.06, 1.2);
  },
  settle: (t) => {
    pillow(t, 80, 0.25, 0.25);
    key(t + 0.02, 67, 0.07, 1.0);
  },
  pip: (t, o) => key(t, pm(o.i ?? 0, 72), 0.1, 1.0),
  stamp: (t) => {
    pillow(t, 62, 0.6, 0.4);
    drop(t + 0.02, 380, 0.08);
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
    breath(t, d, s > 0 ? 1500 : 1100, s > 0 ? 500 : 450, 0.09, out);
    // a soft tune follows each star: blue climbs, pink answers by falling
    for (let k = 0; k < 8; k++) key(t + (k / 8) * d, pm(s > 0 ? 8 + k : 17 - k, 72), 0.035, 1.0, out);
  },
  pillHit: (t) => {
    key(t, pm(7), 0.12, 1.2);
    key(t + 0.07, pm(9), 0.08, 1.1);
  },
  toSeal: (t) => {
    breath(t, 1.3, 600, 1600, 0.08);
    pad(t, [67, 72], 1.3, 0.03);
  },
  merge: (t) => {
    pad(t, [64, 71, 76], 1.8, 0.06);
    key(t + 1, 84, 0.1, 1.6);
    pillow(t + 0.05, 60, 0.18, 0.4);
  },
  charge: (t) => {
    pad(t, [48, 55, 60], 1.1, 0.05);
    breath(t, 1.1, 300, 1200, 0.08);
  },
  crack: (t) => {
    drop(t, 420, 0.15);
    pillow(t, 110, 0.2, 0.2);
    key(t + 0.03, pm(14), 0.06, 0.8);
  },
  flap: (t) => {
    breath(t, 1.4, 500, 1500, 0.14);
    pillow(t + 0.1, 90, 0.18, 0.4);
  },
  leak: (t) => twinkles(t, 1.3, 5, 0.035, 12, 18),
  swell: (t, o) => {
    const d = o.dur ?? 3.7;
    pad(t, [60, 64, 67], d, 0.07);
    breath(t, d, 400, 2000, 0.1);
    const n = Math.floor(d / 0.3);
    for (let k = 0; k < n; k++) key(t + k * 0.3, pm((k % 10) + Math.floor(k / 4), 60), 0.025 + 0.06 * (k / n), 1.0);
  },
  ringPing: (t, o) => key(t, pm((o.i ?? 0) + 3, 72), 0.09, 1.2),
  twinkle: (t) => key(t, pm(Math.floor(rnd(13, 19))), 0.04, 1.0),
  release: (t) => {
    breath(t, 1.1, 400, 2000, 0.14);
    pillow(t, 60, 0.3, 0.4);
    pad(t + 0.05, [67, 71, 74], 1.8, 0.05);
  },
  bloom: (t) => {
    pillow(t, 60, 0.35, 0.8);
    pad(t, [60, 64, 67, 72], 3, 0.07);
    run(t + 0.3, [72, 76, 79, 84, 88], 0.18, 0.1, 2);
  },
  landing: (t) => {
    twinkles(t, 1.6, 10, 0.04);
    pad(t, [64, 71, 76], 2.4, 0.05);
    // the lullaby's opening phrase, as a soft goodbye to the envelope
    run(t + 0.3, [76, 79, 76, 74, 72], 0.42, 0.09, 1.8);
  },
  scratch: (t, o) => {
    const sp = Math.min(40, o.dur ?? 10);
    grain(t, 0.035 + sp * 0.0012);
  },
  scratchDone: (t) => {
    breath(t, 0.6, 700, 2000, 0.1);
    pad(t, [60, 64, 67], 1.6, 0.05);
    run(t + 0.05, [72, 76, 79, 84], 0.14, 0.12, 1.4);
  },
  tap: (t) => drop(t, 650, 0.2),
  chime: (t, o) => {
    key(t, pm(o.i ?? 8, 72), 0.12, 1.2);
    key(t + 0.22, pm((o.i ?? 8) + 2, 72), 0.1, 1.4);
  },
  diamond: (t) => key(t, pm(12), 0.09, 1.2),
  cue: (t) => key(t, pm(9), 0.06, 1.1),
  swish: (t) => {
    breath(t, 0.6, 500, 1100, 0.08);
    key(t + 0.1, 83, 0.04, 1.0);
  },
  whoosh: (t) => breath(t, 0.8, 400, 1500, 0.12),
  pop: (t) => {
    pillow(t, 150, 0.4, 0.15);
    breath(t, 0.18, 2500, 1200, 0.12);
    sprinkle(t + 0.05, 0.8, 16);
  },
  success: (t) => {
    pad(t, [60, 64, 67], 1.6, 0.05);
    run(t, [72, 76, 79, 84], 0.14, 0.12, 1.4);
  },
  heroPill: (t) => key(t, pm(7), 0.1, 1.1),
  heroNames: (t) => {
    run(t, [64, 71, 76], 0.16, 0.12, 2.2);
    run(t + 0.35, [76, 79, 76, 74, 72], 0.26, 0.06, 1.6);
    breath(t, 0.9, 500, 1500, 0.07);
  },
  heroTwin: (t) => {
    key(t, 88, 0.06, 1.1);
    key(t + 0.14, 91, 0.06, 1.1);
  },
  heroCue: (t) => key(t, pm(9), 0.06, 1.2),
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

// Was sound still locked when the guest started this tap? (Browsers keep audio silent until the first tap, so a first tap on the
// sound button must switch sound ON and be heard, not mute something nobody has heard yet.)
let pressedLocked: boolean | null = null;
if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => (pressedLocked = !(ctx && ctx.state === 'running')), true);

export const sfx = {
  /** The sound button: the first tap switches sound on (with a confirming note); after that it mutes / unmutes. */
  toggle() {
    const wasLocked = pressedLocked ?? !(ctx && ctx.state === 'running');
    pressedLocked = null;
    this.unlock();
    if (wasLocked) {
      this.setMuted(false);
      this.cue('ping2', 0);
    } else this.setMuted(!muted);
  },
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
