import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { OrbBody } from './Orb';
import { confetti } from '../lib/confetti';
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
  const orbRef = useRef<HTMLButtonElement>(null);
  // "iris" reveal: a circle of light opens from the orb and dissolves the dark screen away, revealing the page beneath
  const [centre, setCentre] = useState({ x: 0, y: 0 });
  const iris = useMotionValue(0);
  const EDGE = 140;
  const maskImage = useTransform(iris, (r) => (r <= 0 ? 'none' : `radial-gradient(circle at ${centre.x}px ${centre.y}px, transparent ${Math.max(0, r - EDGE)}px, #000 ${r}px)`));
  const ringScale = useTransform(iris, (r) => Math.max(0.01, r / 100));
  const ringOpacity = useTransform(iris, [0, 120, 500, 1300], [0, 0.9, 0.55, 0]);
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
    const r = orbRef.current?.getBoundingClientRect();
    const c = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setCentre(c);
    setLit(true);
    if (simple) {
      leave(400);
      return;
    }
    // the light gathers (0 – 1 s), then opens outwards like a dawn while the page rises beneath it
    const reach = Math.hypot(Math.max(c.x, window.innerWidth - c.x), Math.max(c.y, window.innerHeight - c.y)) + EDGE + 40;
    timers.current.push(
      window.setTimeout(() => {
        void animate(iris, reach, { duration: 2.8, ease: [0.45, 0, 0.2, 1] });
        confetti({ x: c.x, y: c.y, count: 70 });
        timers.current.push(window.setTimeout(onEnter, 500));
        timers.current.push(window.setTimeout(onDone, 2800 + 200));
      }, 1000),
    );
  };
  const skip = () => {
    onStartMusic();
    leave(0);
  };
  // Cross-dissolve: the page starts appearing underneath while the golden overlay fades away on top of it.
  const FADE = simple ? 0.4 : 1.4;
  const leave = (after: number) => {
    timers.current.push(
      window.setTimeout(() => {
        if (!simple) confetti({ x: window.innerWidth / 2, y: window.innerHeight / 2, count: 90 });
        onEnter();
        setLeaving(true);
        timers.current.push(window.setTimeout(onDone, FADE * 1000 + 100));
      }, after),
    );
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE, ease: 'easeInOut' }}
      style={{ pointerEvents: leaving || lit ? 'none' : 'auto', maskImage, WebkitMaskImage: maskImage }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ocean"
      role="dialog"
      aria-label="Invitation introduction"
      onPointerMove={lean}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(227,190,116,.10), rgba(11,16,14,0) 60%)' }} aria-hidden="true" />

      {/* waiting-screen life: twinkling stars, rising gold dust, shooting stars, a breathing glow */}
      <motion.div className="pointer-events-none absolute -inset-10" style={{ x: farX, y: farY }} aria-hidden="true">
        <StarField count={46} />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="ambient absolute -left-[25%] top-[8%] h-[70vmax] w-[70vmax] rounded-full opacity-[.16] blur-3xl" style={{ background: 'radial-gradient(circle, #7FB6E6, transparent 65%)', animation: 'aurora 16s ease-in-out infinite alternate' }} />
        <span className="ambient absolute -right-[30%] top-[30%] h-[65vmax] w-[65vmax] rounded-full opacity-[.15] blur-3xl" style={{ background: 'radial-gradient(circle, #F2A6C0, transparent 65%)', animation: 'aurora 20s ease-in-out -6s infinite alternate-reverse' }} />
        <span className="ambient absolute left-[10%] -bottom-[25%] h-[60vmax] w-[60vmax] rounded-full opacity-[.15] blur-3xl" style={{ background: 'radial-gradient(circle, #E3BE74, transparent 65%)', animation: 'aurora 18s ease-in-out -3s infinite alternate' }} />
        {SPARKS.map((m, i) => (
          <svg key={i} viewBox="0 0 24 24" className="ambient absolute opacity-0" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animation: `twirl ${m.dur}s ease-in-out ${m.delay}s infinite` }}>
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#F3DC9C" />
          </svg>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
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

      <motion.div style={{ x: sx, y: sy }} className="relative">
      <button
        ref={orbRef}
        type="button"
        onClick={ignite}
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

      {!lit && (
        <div className="pointer-events-none absolute bottom-[calc(12%+64px)] flex flex-col items-center" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 24 24" className="ambient -mb-3 h-6 w-6 opacity-0" style={{ animation: `chevUp 2s ease-in-out ${0.9 - i * 0.3 + 1.2}s infinite` }} fill="none" stroke="#E3BE74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 15l6-6 6 6" />
            </svg>
          ))}
        </div>
      )}

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: lit ? 0 : 1 }} transition={{ delay: lit ? 0 : 1.2, duration: 0.8 }} className="absolute bottom-[12%] rounded-full border border-sun/50 px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ivory">
        Tap the light to begin
      </motion.p>

      <button type="button" onClick={skip} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/30 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory hover:bg-white/10">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </motion.div>
    {lit && !simple && (
      <motion.div aria-hidden="true" className="pointer-events-none fixed z-[101] h-[200px] w-[200px] rounded-full" style={{ left: centre.x - 100, top: centre.y - 100, scale: ringScale, opacity: ringOpacity, border: '2px solid rgba(243,220,156,.6)', boxShadow: '0 0 50px 10px rgba(227,190,116,.4), inset 0 0 50px 8px rgba(227,190,116,.3)' }} />
    )}
    </>
  );
}
