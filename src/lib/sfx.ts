// The invitation's sound: ONE gentle background lullaby that plays through the whole page. It is an original tune synthesised
// live with the Web Audio API (no audio file, nothing to license): a soft celesta melody over a warm pad and a low bass note,
// looping every 8 bars. The per-animation sound effects were removed; `play` and `cue` stay as harmless no-ops so the animation
// code does not need to change.
//
// Browsers only allow sound after a tap, so the music starts the moment the guest first touches the page, fading in softly.
// To use a real recording instead (e.g. a Malayalam lullaby you have the rights to), see README.md.

export type SfxName = string;
interface Opt { i?: number; side?: number; dur?: number }

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let send: GainNode;
let muted = false; // sound starts ON every visit; the button mutes / unmutes
let unlocked = false;
let started = false;
let timer = 0;
let nextBar = 0;
let barNo = 0;
const listeners = new Set<() => void>();
const watchers = new Set<() => void>();
const emit = () => watchers.forEach((w) => w());

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function build(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const c = new AC();
  ctx = c;
  master = c.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 24;
  comp.ratio.value = 3;
  master.connect(comp);
  comp.connect(c.destination);
  // a soft, dark hall
  const len = Math.floor(c.sampleRate * 2.8);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp += ((Math.random() * 2 - 1) - lp) * 0.3;
      d[i] = lp * Math.pow(1 - i / len, 2.6) * (i < 1200 ? i / 1200 : 1);
    }
  }
  const conv = c.createConvolver();
  conv.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.45;
  conv.connect(wet);
  wet.connect(master);
  send = c.createGain();
  send.connect(conv);
  musicBus = c.createGain();
  musicBus.gain.value = 0.0001;
  musicBus.connect(master);
  musicBus.connect(send);
  return c;
}

// ---------- the lullaby ----------
const BPM = 64;
const BEAT = 60 / BPM;
// chord per bar: [bass, ...pad notes] (midi)
const CHORDS: number[][] = [
  [48, 60, 64, 67], // C
  [45, 57, 60, 64], // Am
  [41, 57, 60, 65], // F
  [43, 59, 62, 67], // G
  [48, 60, 64, 67], // C
  [45, 57, 60, 64], // Am
  [41, 57, 60, 65], // F
  [43, 59, 62, 67], // G
];
// melody per bar: [midi, beat, length-in-beats]
const MELODY: [number, number, number][][] = [
  [[76, 0, 1], [79, 1, 1], [84, 2, 1], [79, 3, 1]],
  [[81, 0, 1], [79, 1, 1], [76, 2, 2]],
  [[77, 0, 1], [81, 1, 1], [84, 2, 1], [81, 3, 1]],
  [[83, 0, 1], [79, 1, 1], [74, 2, 2]],
  [[79, 0, 1], [76, 1, 1], [72, 2, 1], [76, 3, 1]],
  [[81, 0, 1], [84, 1, 1], [88, 2, 2]],
  [[84, 0, 1], [81, 1, 1], [77, 2, 1], [81, 3, 1]],
  [[79, 0, 1], [74, 1, 1], [72, 2, 2]],
];

function lowpass(f: number) {
  const l = ctx!.createBiquadFilter();
  l.type = 'lowpass';
  l.frequency.value = f;
  l.Q.value = 0.5;
  return l;
}

function key(t: number, m: number, v: number, dur: number) {
  const c = ctx!;
  const f = mtof(m);
  const l = lowpass(Math.min(2400, f * 3));
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
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
  g.connect(musicBus);
}

function pad(t: number, notes: number[], dur: number, v: number) {
  const c = ctx!;
  for (const m of notes)
    for (const dt of [-5, 5]) {
      const o = c.createOscillator();
      const l = lowpass(800);
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = mtof(m);
      o.detune.value = dt;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(l);
      l.connect(g);
      g.connect(musicBus);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
}

function bass(t: number, m: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const l = lowpass(300);
  const g = c.createGain();
  o.frequency.value = mtof(m);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 3.6);
  o.connect(l);
  l.connect(g);
  g.connect(musicBus);
  o.start(t);
  o.stop(t + BEAT * 3.7);
}

function scheduleBar(i: number, t: number) {
  const ch = CHORDS[i];
  bass(t, ch[0]);
  pad(t, ch.slice(1), BEAT * 4.6, 0.032);
  for (const [m, b, len] of MELODY[i]) key(t + b * BEAT, m, 0.085, BEAT * (len + 1.4));
  // a soft echo of the bar's last note, one octave up, to make it sparkle
  const last = MELODY[i][MELODY[i].length - 1];
  key(t + (last[1] + 0.5) * BEAT, last[0] + 12, 0.025, BEAT * 2);
}

function startMusic() {
  if (started || !ctx || ctx.state !== 'running') return;
  started = true;
  const c = ctx;
  musicBus.gain.cancelScheduledValues(c.currentTime);
  musicBus.gain.setValueAtTime(0.0001, c.currentTime);
  musicBus.gain.exponentialRampToValueAtTime(0.7, c.currentTime + 4); // fade in softly
  nextBar = c.currentTime + 0.15;
  barNo = 0;
  const tick = () => {
    if (!ctx || ctx.state !== 'running') return;
    while (nextBar < ctx.currentTime + 2.5) {
      scheduleBar(barNo % CHORDS.length, nextBar);
      nextBar += BEAT * 4;
      barNo++;
    }
  };
  tick();
  timer = window.setInterval(tick, 400);
}

// ---------- public api ----------
let pressedLocked: boolean | null = null;
if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => (pressedLocked = !(ctx && ctx.state === 'running')), true);

export const sfx = {
  /** The sound button: the first tap switches the music on; after that it mutes / unmutes. */
  toggle() {
    const wasLocked = pressedLocked ?? !(ctx && ctx.state === 'running');
    pressedLocked = null;
    this.unlock();
    if (wasLocked) this.setMuted(false);
    else this.setMuted(!muted);
  },
  /** Unlock sound (call from a tap / key press) and start the music. Safe to call many times. */
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
      startMusic();
      listeners.forEach((l) => l());
      emit();
    };
    if (c.state === 'running') done();
    else void c.resume().then(done, () => undefined);
  },
  /** Create the context without a gesture; some browsers (desktop, returning visitors) let it run straight away. */
  tryAuto() {
    const c = build();
    if (c && c.state === 'running') {
      unlocked = true;
      startMusic();
    }
    return !!c && c.state === 'running';
  },
  running: () => !!ctx && ctx.state === 'running',
  onUnlock(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setMuted(m: boolean) {
    muted = m;
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.15);
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
  // The sound effects were removed (one background music only); these stay so the animation code can keep calling them.
  play(_name: SfxName, _delayMs?: number, _opt?: Opt) {
    void _name;
  },
  cue(_name: SfxName, _delayMs: number, _opt?: Opt) {
    void _name;
  },
  stopScheduled() {},
  clearQueue() {},
  unlockedOnce: () => unlocked,
  /** Stop the music for good (not used by the page today). */
  stop() {
    window.clearInterval(timer);
  },
};
