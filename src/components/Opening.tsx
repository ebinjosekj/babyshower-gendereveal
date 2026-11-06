import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { OrbBody } from './Orb';
import { confetti } from '../lib/confetti';
import NudgeStar from './NudgeStar';
import { StarField } from './ui';

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: rnd(i + 10) * 100,
  size: 2 + rnd(i + 50) * 3,
  dur: 12 + rnd(i + 90) * 14,
  delay: -rnd(i + 130) * 24,
  sway: (rnd(i + 170) - 0.5) * 100,
}));
const SPARKS = Array.from({ length: 11 }, (_, i) => ({
  left: 5 + rnd(i + 300) * 90,
  top: 5 + rnd(i + 340) * 90,
  size: 9 + rnd(i + 380) * 15,
  dur: 4 + rnd(i + 420) * 5,
  delay: -rnd(i + 460) * 8,
}));
const FIREFLIES = Array.from({ length: 16 }, (_, i) => {
  const a = rnd(i + 700) * Math.PI * 2;
  const d = 150 + rnd(i + 740) * 140;
  return { sx: Math.cos(a) * d, sy: Math.sin(a) * d * 0.9, delay: rnd(i + 780) * 6, dur: 4 + rnd(i + 820) * 3, size: 3 + rnd(i + 860) * 3 };
});
const BURST = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2 + ((i * 7919) % 13) * 0.05;
  const d = 140 + ((i * 6151) % 17) * 22;
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, delay: 0.35 + (i % 6) * 0.07, size: 3 + (i % 4) * 1.5 };
});

interface Props {
  onStartMusic: () => void; // runs inside a user gesture
  onEnter: () => void; // the flash peaks → the page behind starts its entrance
  onDone: () => void; // the overlay has fully faded away → remove it
}

// A dark screen with one small, waiting light. Tap / click / Enter ignites it and opens the invitation.
export default function Opening({ onStartMusic, onEnter, onDone }: Props) {
  const { simple } = useMotion();
  const [lit, setLit] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  // if the guest hasn't tapped after 5 seconds, a shooting star flies to the orb (and again every 9 seconds)
  const [nudge, setNudge] = useState(0);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (lit || simple) return;
    let id = 0;
    const loop = () => {
      setNudge((n) => n + 1);
      id = window.setTimeout(loop, 9000);
    };
    id = window.setTimeout(loop, 5000);
    return () => window.clearTimeout(id);
  }, [lit, simple]);
  // the light leans gently towards the finger / cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 14 });
  const sy = useSpring(my, { stiffness: 50, damping: 14 });
  const farX = useTransform(sx, (v) => -v * 0.7);
  const farY = useTransform(sy, (v) => -v * 0.7);
  const lean = (e: { clientX: number; clientY: number }) => {
    mx.set((e.clientX / window.innerWidth - 0.5) * 36);
    my.set((e.clientY / window.innerHeight - 0.5) * 36);
  };

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const ignite = () => {
    if (lit) return;
    onStartMusic();
    setLit(true);
    if (simple) {
      leave(400);
      return;
    }
    // 0 – 1 s the light gathers; then the dark screen melts away (opacity only, so it stays smooth) while the page rises beneath
    timers.current.push(window.setTimeout(() => leave(0), 1000));
  };
  const skip = () => {
    onStartMusic();
    leave(0);
  };
  // Cross-dissolve: the page starts appearing underneath while the golden overlay fades away on top of it.
  const FADE = simple ? 0.4 : 2.4;
  const leave = (after: number) => {
    timers.current.push(
      window.setTimeout(() => {
        onEnter();
        if (!simple) timers.current.push(window.setTimeout(() => confetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.45, count: 45 }), 500));
        setLeaving(true);
        timers.current.push(window.setTimeout(onDone, FADE * 1000 + 100));
      }, after),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE, ease: 'easeInOut' }}
      style={{ pointerEvents: leaving || lit ? 'none' : 'auto', willChange: 'opacity' }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ocean ${lit ? 'opening-lit' : ''}`}
      role="dialog"
      aria-label="Invitation introduction"
      onPointerMove={lean}
      onClick={ignite}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(227,190,116,.10), rgba(11,16,14,0) 60%)' }} aria-hidden="true" />

      {/* waiting-screen life: twinkling stars, rising gold dust, shooting stars, a breathing glow */}
      <motion.div className="pointer-events-none absolute -inset-10" style={{ x: farX, y: farY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4 }} aria-hidden="true">
        <StarField count={46} />
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3.2, delay: 0.6 }} aria-hidden="true">
        <span className="ambient absolute -left-[25%] top-[8%] h-[70vmax] w-[70vmax] rounded-full opacity-[.16]" style={{ background: 'radial-gradient(circle, #7FB6E6, transparent 65%)', animation: 'aurora 16s ease-in-out infinite alternate' }} />
        <span className="ambient absolute -right-[30%] top-[30%] h-[65vmax] w-[65vmax] rounded-full opacity-[.15]" style={{ background: 'radial-gradient(circle, #F2A6C0, transparent 65%)', animation: 'aurora 20s ease-in-out -6s infinite alternate-reverse' }} />
        <span className="ambient absolute left-[10%] -bottom-[25%] h-[60vmax] w-[60vmax] rounded-full opacity-[.15]" style={{ background: 'radial-gradient(circle, #E3BE74, transparent 65%)', animation: 'aurora 18s ease-in-out -3s infinite alternate' }} />
        {SPARKS.map((m, i) => (
          <svg key={i} viewBox="0 0 24 24" className="ambient absolute opacity-0" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animation: `twirl ${m.dur}s ease-in-out ${m.delay}s infinite` }}>
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#F3DC9C" />
          </svg>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* two slow searchlight beams and a warm horizon that breathes */}
        <span className="ambient absolute -top-[10%] left-1/2 block h-[130%] w-[160%] -translate-x-1/2" style={{ background: 'conic-gradient(from 166deg at 50% 0%, transparent 0deg, rgba(255,233,168,.09) 5deg, transparent 11deg, transparent 17deg, rgba(255,233,168,.07) 22deg, transparent 28deg)', transformOrigin: '50% 0%', animation: 'beamSway 14s ease-in-out infinite alternate' }} />
        <span className="ambient absolute bottom-0 left-0 block h-[42%] w-full" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(227,190,116,.22), transparent 65%)', animation: 'horizon 6s ease-in-out infinite' }} />
        {MOTES.map((m, i) => (
          <span key={i} className="ambient absolute bottom-0 rounded-full bg-[#F3DC9C]" style={{ left: `${m.left}%`, width: m.size, height: m.size, opacity: 0.6, boxShadow: '0 0 8px 2px rgba(227,190,116,.55)', ['--sway' as string]: `${m.sway}px`, animation: `riseUp ${m.dur}s linear ${m.delay}s infinite` }} />
        ))}
        {[{ t: 8, l: 78, d: 1.5, u: 7 }, { t: 24, l: 96, d: 4.5, u: 9 }].map((m, i) => (
          <span key={i} className="ambient absolute block h-[2px] w-[130px] rounded-full opacity-0" style={{ top: `${m.t}%`, left: `${m.l}%`, background: 'linear-gradient(90deg,#FFF6D6,rgba(255,246,214,0))', boxShadow: '0 0 10px 2px rgba(255,236,160,.5)', animation: `shoot ${m.u}s linear ${m.d}s infinite` }} />
        ))}
        <span className="ambient absolute left-1/2 top-[46%] block h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(227,190,116,.16), transparent 62%)', animation: 'glowBreath 5s ease-in-out infinite' }} />
      </div>

      <motion.p animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 1.4 }} className="absolute top-[14%] px-8 text-center font-display text-3xl font-light italic text-ivory sm:text-5xl">
        {['Something small', 'is on the way.'].map((line, i) => (
          <motion.span key={line} className="shimmer-text block" initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.5, delay: 0.5 + i * 0.7, ease: [0.22, 1, 0.36, 1] }}>
            {line}
          </motion.span>
        ))}
      </motion.p>

      <motion.div style={{ x: sx, y: sy }} className="relative" initial={{ opacity: 0, scale: 0.55 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); ignite(); }}
        disabled={lit}
        aria-label="Light the orb to open the invitation"
        className="group relative flex h-56 w-56 items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-sun disabled:cursor-default sm:h-64 sm:w-64"
      >
        {/* slowly turning dashed ring with a travelling light, and a second ripple */}
        {!lit && (
          <>
            <span className="ambient absolute -inset-9 rounded-full border border-dashed border-sun/25" style={{ animation: 'orbit 60s linear infinite' }} aria-hidden="true">
              <span className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#FFE9A8]" style={{ boxShadow: '0 0 12px 3px rgba(227,190,116,.8)' }} />
            </span>
            <span className="ambient absolute -inset-16 rounded-full border border-sun/15" style={{ animation: 'orbit 90s linear infinite reverse' }} aria-hidden="true">
              <span className="absolute bottom-[-3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blush" style={{ boxShadow: '0 0 10px 2px rgba(242,166,192,.7)' }} />
            </span>
            <span className="ambient absolute inset-0 rounded-full border border-sun/40" style={{ animation: 'ripple 3.4s ease-out 1.2s infinite' }} aria-hidden="true" />
            {/* the orb breathes light in: a ring that contracts onto it */}
            <span className="ambient absolute inset-0 rounded-full border border-sun/50" style={{ animation: 'inhale 3.4s ease-in 0s infinite' }} aria-hidden="true" />
            {/* tilted orbits with little planets of light */}
            <span className="absolute -inset-20" style={{ transform: 'rotate(-24deg) scaleY(.3)' }} aria-hidden="true">
              <span className="ambient absolute inset-0 rounded-full border border-sun/25" style={{ animation: 'orbit 16s linear infinite' }}>
                <span className="absolute left-1/2 top-[-5px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#FFE9A8]" style={{ boxShadow: '0 0 14px 4px rgba(227,190,116,.85)' }} />
              </span>
            </span>
            <span className="absolute -inset-24" style={{ transform: 'rotate(28deg) scaleY(.26)' }} aria-hidden="true">
              <span className="ambient absolute inset-0 rounded-full border border-skyblue/20" style={{ animation: 'orbit 23s linear infinite reverse' }}>
                <span className="absolute left-1/2 top-[-4px] h-2 w-2 -translate-x-1/2 rounded-full bg-skyblue" style={{ boxShadow: '0 0 12px 3px rgba(127,182,230,.8)' }} />
              </span>
            </span>
            {/* fireflies of light drawn into the orb */}
            {FIREFLIES.map((f, i) => (
              <span key={i} className="ambient absolute left-1/2 top-1/2 rounded-full bg-[#FFE9A8] opacity-0" style={{ width: f.size, height: f.size, marginLeft: -f.size / 2, marginTop: -f.size / 2, boxShadow: '0 0 10px 3px rgba(255,224,140,.8)', ['--sx' as string]: `${f.sx}px`, ['--sy' as string]: `${f.sy}px`, animation: `converge ${f.dur}s ease-in ${f.delay}s infinite` }} aria-hidden="true" />
            ))}
          </>
        )}
        {/* waiting ring */}
        <span className="ambient absolute inset-0 rounded-full border border-sun/50" style={{ animation: lit ? undefined : 'gatePulse 3s ease-in-out infinite' }} aria-hidden="true" />
        <span className="absolute inset-5 rounded-full border border-sun/20" aria-hidden="true" />
        {lit && <span className="absolute inset-0 rounded-full border border-sun" style={{ animation: 'ringPulse 1.6s ease-out forwards' }} aria-hidden="true" />}
        <motion.div className="w-[46%]" animate={lit ? { scale: simple ? 1.6 : 2.6, opacity: simple ? 1 : 0.0 } : simple ? { scale: 1, opacity: 1 } : { scale: [1, 1.08, 1, 1.05, 1], opacity: 1 }} transition={lit ? { duration: simple ? 0.4 : 1.6, ease: [0.4, 0, 0.2, 1] } : simple ? { duration: 0.3 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} whileTap={lit ? undefined : { scale: 0.92 }}>
          <OrbBody tone="gold" rings={false} />
        </motion.div>
      </button>
      </motion.div>

      {lit && !simple && (
        <>
          {/* a big soft wave of light that spreads out of the orb (transform + opacity only: smooth on phones) */}
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 block h-[230vmax] w-[230vmax] rounded-full" style={{ marginLeft: '-115vmax', marginTop: '-115vmax', background: 'radial-gradient(circle, rgba(255,236,170,.6) 0%, rgba(227,190,116,.3) 22%, rgba(227,190,116,0) 55%)', willChange: 'transform, opacity', animation: 'lightWave 2.8s cubic-bezier(.3,0,.2,1) .7s both' }} />
          {/* slow turning rays of light */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,233,168,.26) 0deg 5deg, transparent 5deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 55%)', maskImage: 'radial-gradient(circle, #000 0%, transparent 55%)' }}
            initial={{ opacity: 0, rotate: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.9, 0.9], rotate: 70, scale: 1 }}
            transition={{ duration: 4.4, ease: 'easeOut', opacity: { duration: 2.4, times: [0, 0.4, 1] } }}
          />
          {/* rings of light spreading outwards */}
          {[0.15, 0.6, 1.05].map((d) => (
            <span key={d} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[40vmin] w-[40vmin] rounded-full border-2 border-sun" style={{ marginLeft: '-20vmin', marginTop: '-20vmin', boxShadow: '0 0 30px rgba(227,190,116,.6)', animation: `openRing 2s ease-out ${d}s both` }} />
          ))}
          {/* sparks flying out of the light */}
          {BURST.map((b, i) => (
            <span key={i} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-[#FFF4B8]" style={{ width: b.size, height: b.size, boxShadow: '0 0 10px 3px rgba(255,224,140,.9)', ['--dx' as string]: `${b.dx}px`, ['--dy' as string]: `${b.dy}px`, animation: `burst 1.7s cubic-bezier(.15,.7,.3,1) ${b.delay}s both` }} />
          ))}
        </>
      )}

      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FFF1C8_0%,#E3BE74_40%,rgba(227,190,116,0)_75%)]" initial={{ opacity: 0 }} animate={simple ? { opacity: lit ? 0.95 : 0 } : { opacity: lit ? [0, 0.5, 0.18] : 0 }} transition={simple ? { duration: 0.3 } : { duration: 2.2, times: [0, 0.45, 1], ease: 'easeInOut' }} aria-hidden="true" />

      {/* a quiet, elegant cue under the orb: a beating dot and one short line */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(50%+11rem)] flex justify-center sm:top-[calc(50%+12.5rem)]" aria-hidden="true">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={lit ? { opacity: 0, y: -8, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }} transition={lit ? { duration: 0.6, ease: 'easeIn' } : { duration: 1.6, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}>
          <span className="relative flex items-center gap-3 rounded-full border border-sun/40 bg-ocean/50 px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ivory">
            <span className="relative flex h-2 w-2">
              <span className="ambient absolute inset-0 rounded-full bg-sun" style={{ animation: 'ripple 2.2s ease-out infinite' }} />
              <span className="relative block h-2 w-2 rounded-full bg-sun" style={{ boxShadow: '0 0 10px 2px rgba(227,190,116,.8)' }} />
            </span>
            Tap the light to open
            <span className="ambient absolute -inset-1.5 rounded-full border border-sun/25" style={{ animation: 'gatePulse 3.2s ease-in-out infinite' }} />
            <span key={pulse} className="absolute -inset-2 rounded-full border-2 border-sun opacity-0" style={{ animation: pulse ? 'pillFlash 1.8s ease-out 1' : undefined }} />
          </span>
        </motion.div>
      </div>

      {nudge > 0 && !lit && (
        <NudgeStar key={nudge} from={{ x: window.innerWidth * 0.9, y: window.innerHeight * 0.07 }} to={{ x: window.innerWidth / 2, y: window.innerHeight * 0.5 }} onLand={() => setPulse((p) => p + 1)} />
      )}
      {pulse > 0 && !lit && <span key={`r${pulse}`} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -ml-12 -mt-12 block h-24 w-24 rounded-full border-2 border-sun" style={{ animation: 'openRing 1.5s ease-out both' }} />}

      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/30 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory hover:bg-white/10">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </motion.div>
  );
}
