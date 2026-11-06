import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { OrbBody } from './Orb';
import { confetti } from '../lib/confetti';
import MilkyWay from './MilkyWay';

type Phase = 'build' | 'l1' | 'gap1' | 'l2' | 'gap2' | 'orb' | 'ready';
const READY_AT = 13; // seconds into the journey when the light has landed and the orb can be tapped
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

// The Milky Way opens the invitation: a small light leaves the galaxy's heart and lands as the glowing orb. Tap it to open.
export default function Opening({ onStartMusic, onEnter, onDone }: Props) {
  const { simple } = useMotion();
  const [lit, setLit] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [phase, setPhase] = useState<Phase>(simple ? 'ready' : 'build');
  const timers = useRef<number[]>([]);
  const clock = useRef(0);
  const orbRef = useRef<HTMLButtonElement>(null);
  const ready = phase === 'ready';
  const orbVisible = simple || phase === 'orb' || ready;
  // the light leans gently towards the finger / cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 14 });
  const sy = useSpring(my, { stiffness: 50, damping: 14 });
  const lean = (e: { clientX: number; clientY: number }) => {
    mx.set((e.clientX / window.innerWidth - 0.5) * 36);
    my.set((e.clientY / window.innerHeight - 0.5) * 36);
  };

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // the sky is painted: start the story
  const begin = () => {
    const at = (sec: number, ph: Phase) => timers.current.push(window.setTimeout(() => setPhase(ph), sec * 1000));
    at(1.2, 'l1');
    at(4.6, 'gap1');
    at(5.4, 'l2');
    at(10.6, 'gap2');
    at(11.4, 'orb');
    at(READY_AT, 'ready');
  };
  // tapping early jumps straight to the landed light
  const skipAhead = () => {
    if (simple || lit || phase === 'build' || ready) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    clock.current = performance.now() - (READY_AT + 0.3) * 1000;
    setPhase('ready');
  };

  const ignite = () => {
    if (lit || !ready) return;
    onStartMusic();
    setLit(true);
    leave(simple ? 400 : 2500);
  };
  const skip = () => {
    onStartMusic();
    leave(0);
  };
  // Cross-dissolve: the page starts appearing underneath while the golden overlay fades away on top of it.
  const FADE = simple ? 0.4 : 2.2;
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
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE, ease: 'easeInOut' }}
      style={{ pointerEvents: leaving ? 'none' : 'auto' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ocean"
      role="dialog"
      aria-label="Invitation introduction"
      onPointerMove={lean}
      onPointerDown={skipAhead}
    >
      {simple ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(227,190,116,.10), rgba(11,16,14,0) 60%)' }} aria-hidden="true" />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[#02030a]" aria-hidden="true" />
          <MilkyWay targetRef={orbRef} clock={clock} lit={lit} onBuilt={begin} />
        </>
      )}

      {/* the story, one line at a time */}
      {!simple && (
        <>
          {[
            { show: phase === 'l1', text: 'Beyond all the stars you know,' },
            { show: phase === 'l2', text: 'one small light left the heart of the Milky Way…' },
          ].map((l) => (
            <motion.p key={l.text} aria-hidden="true" initial={false} animate={l.show ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(12px)' }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="pointer-events-none absolute top-[12%] px-8 text-center font-display text-3xl font-light italic text-ivory [text-shadow:0_2px_30px_rgba(0,0,0,.9)] sm:text-5xl">
              {l.text}
            </motion.p>
          ))}
        </>
      )}
      <motion.p initial={false} animate={ready && !lit ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 18, filter: 'blur(10px)' }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} className="pointer-events-none absolute top-[14%] px-8 text-center font-display text-3xl font-light italic text-ivory sm:text-5xl">
        {['Something small', 'is on the way.'].map((line) => (
          <span key={line} className="shimmer-text block">
            {line}
          </span>
        ))}
      </motion.p>

      <motion.div style={{ x: sx, y: sy }} className="relative" initial={false} animate={{ opacity: orbVisible ? 1 : 0, scale: orbVisible ? 1 : 0.5 }} transition={{ duration: simple ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}>
      <button
        ref={orbRef}
        type="button"
        onClick={ignite}
        disabled={lit || !ready}
        aria-label="Light the orb to open the invitation"
        className={`group relative flex h-56 w-56 items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-sun disabled:cursor-default sm:h-64 sm:w-64 ${ready ? '' : 'pointer-events-none'}`}
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
        <motion.div className="w-[46%]" animate={lit ? { scale: simple ? 1.6 : 7, opacity: simple ? 1 : 0.0 } : simple ? { scale: 1, opacity: 1 } : { scale: [1, 1.08, 1, 1.05, 1], opacity: 1 }} transition={lit ? { duration: simple ? 0.4 : 1.9, ease: [0.5, 0, 0.7, 0.3] } : simple ? { duration: 0.3 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} whileTap={lit ? undefined : { scale: 0.92 }}>
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
            style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,233,168,.42) 0deg 5deg, transparent 5deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 55%)', maskImage: 'radial-gradient(circle, #000 0%, transparent 55%)' }}
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

      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FFF1C8_0%,#E3BE74_40%,rgba(227,190,116,0)_75%)]" initial={{ opacity: 0 }} animate={{ opacity: lit ? 0.95 : 0 }} transition={{ duration: simple ? 0.3 : 1.5, delay: lit && !simple ? 0.5 : 0 }} aria-hidden="true" />

      {lit && !simple && (
        <motion.p
          aria-hidden="true"
          className="pointer-events-none absolute px-8 text-center font-display text-6xl font-light italic text-ocean sm:text-8xl"
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(14px)' }}
          animate={{ opacity: [0, 1, 1], scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Welcome
        </motion.p>
      )}

      {!lit && ready && (
        <div className="pointer-events-none absolute bottom-[calc(12%+64px)] flex flex-col items-center" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 24 24" className="ambient -mb-3 h-6 w-6 opacity-0" style={{ animation: `chevUp 2s ease-in-out ${0.9 - i * 0.3 + 1.2}s infinite` }} fill="none" stroke="#E3BE74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 15l6-6 6 6" />
            </svg>
          ))}
        </div>
      )}

      <motion.p initial={false} animate={{ opacity: ready && !lit ? 1 : 0 }} transition={{ delay: ready && !lit ? 0.9 : 0, duration: 0.8 }} className="absolute bottom-[12%] rounded-full border border-sun/50 px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ivory">
        Tap the light to begin
      </motion.p>

      <button type="button" onClick={skip} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/30 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory hover:bg-white/10">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </motion.div>
  );
}
