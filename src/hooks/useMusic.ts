import { useCallback, useEffect, useRef, useState } from 'react';
import { MUSIC } from '../config';

// Background music. By default an ORIGINAL music-box lullaby is synthesised in the
// browser with the Web Audio API (no audio file, nothing to license). If you set
// MUSIC.useFile = true in config.ts, public/audio/wonder.mp3 is used instead.
// Playback only ever starts from a user gesture (never autoplay).

interface Engine {
  play: () => void;
  pause: () => void;
  setLevel: (v: number) => void;
  destroy: () => void;
}

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// 3/4 lullaby in C major: [midi, beats]
const MELODY: [number, number][] = [
  [76, 1], [79, 1], [76, 1], [74, 1], [72, 2], [69, 1], [72, 1], [69, 1], [67, 3],
  [76, 1], [79, 1], [81, 1], [79, 2], [76, 1], [74, 1], [76, 1], [74, 1], [72, 3],
  [77, 1], [76, 1], [74, 1], [72, 1], [74, 1], [76, 1], [74, 1], [72, 1], [71, 1], [72, 3],
  [79, 1], [76, 1], [72, 1], [74, 1], [71, 1], [67, 1], [69, 1], [72, 1], [76, 1], [72, 3],
];
// one arpeggio chord per bar (16 bars)
const C = [48, 55, 64];
const G = [43, 55, 62];
const F = [41, 53, 60];
const AM = [45, 52, 60];
const CHORDS = [C, C, F, C, C, C, G, C, F, C, G, C, C, G, AM, C];

interface Ev {
  beat: number;
  midi: number;
  dur: number;
  vel: number;
}
const EVENTS: Ev[] = (() => {
  const ev: Ev[] = [];
  let b = 0;
  for (const [midi, dur] of MELODY) {
    ev.push({ beat: b, midi, dur, vel: 0.2 });
    b += dur;
  }
  CHORDS.forEach((ch, bar) => ch.forEach((midi, i) => ev.push({ beat: bar * 3 + i, midi, dur: 1, vel: 0.08 })));
  return ev.sort((x, y) => x.beat - y.beat);
})();
const LOOP_BEATS = 16 * 3 + 2; // two beats of rest before it repeats
const BEAT = 0.74;

function createSynth(initialLevel: number): Engine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer = 0;
  let idx = 0;
  let loopStart = 0;
  let level = initialLevel;

  const ensure = (): AudioContext => {
    if (ctx && master) return ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const c = new AC();
    const m = c.createGain();
    m.gain.value = level * 0.55;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 5200;
    const delay = c.createDelay();
    delay.delayTime.value = 0.28;
    const fb = c.createGain();
    fb.gain.value = 0.28;
    const wet = c.createGain();
    wet.gain.value = 0.3;
    m.connect(lp);
    lp.connect(c.destination);
    lp.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(c.destination);
    ctx = c;
    master = m;
    return c;
  };

  const note = (c: AudioContext, freq: number, t: number, dur: number, vel: number) => {
    if (!master) return;
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    const g2 = c.createGain();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.value = freq;
    o2.frequency.value = freq * 2.01;
    g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(master);
    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  };

  const schedule = () => {
    if (!ctx) return;
    const horizon = ctx.currentTime + 2.5;
    while (loopStart + EVENTS[idx].beat * BEAT < horizon) {
      const e = EVENTS[idx];
      note(ctx, mtof(e.midi), loopStart + e.beat * BEAT, e.dur * BEAT * 1.7, e.vel);
      idx += 1;
      if (idx >= EVENTS.length) {
        idx = 0;
        loopStart += LOOP_BEATS * BEAT;
      }
    }
  };

  return {
    play: () => {
      const c = ensure();
      void c.resume();
      if (!timer) {
        loopStart = Math.max(loopStart, c.currentTime + 0.2);
        timer = window.setInterval(schedule, 400);
        schedule();
      }
    },
    pause: () => {
      window.clearInterval(timer);
      timer = 0;
      if (ctx) void ctx.suspend();
    },
    setLevel: (v) => {
      level = v;
      if (ctx && master) master.gain.setTargetAtTime(v * 0.55, ctx.currentTime, 0.15);
    },
    destroy: () => {
      window.clearInterval(timer);
      if (ctx) void ctx.close();
    },
  };
}

function createFile(initialLevel: number): Engine {
  const a = new Audio(MUSIC.src);
  a.loop = true;
  a.preload = 'auto';
  a.volume = initialLevel;
  return {
    play: () => void a.play().catch(() => undefined),
    pause: () => a.pause(),
    setLevel: (v) => {
      a.volume = Math.min(1, Math.max(0, v));
    },
    destroy: () => a.pause(),
  };
}

export interface Music {
  playing: boolean;
  muted: boolean;
  volume: number;
  start: () => void; // begin if never started (call from a user gesture)
  toggle: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
}

export function useMusic(): Music {
  const engine = useRef<Engine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const levelRef = useRef(0.6);

  const level = muted ? 0 : volume;
  useEffect(() => {
    levelRef.current = level;
    engine.current?.setLevel(level);
  }, [level]);

  useEffect(
    () => () => {
      engine.current?.destroy();
      engine.current = null;
    },
    [],
  );

  const ensure = () => {
    if (!engine.current) engine.current = MUSIC.useFile ? createFile(levelRef.current) : createSynth(levelRef.current);
    return engine.current;
  };

  const start = useCallback(() => {
    if (engine.current) return; // already started once — the control decides from here
    ensure().play();
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    const e = ensure();
    setPlaying((p) => {
      if (p) e.pause();
      else e.play();
      return !p;
    });
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (v > 0) setMuted(false);
  }, []);

  return { playing, muted, volume, start, toggle, toggleMute, setVolume };
}
