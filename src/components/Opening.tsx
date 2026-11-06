import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { OrbBody } from './Orb';

interface Props {
  onStartMusic: () => void; // runs inside a user gesture
  onEnter: () => void; // opening finished → show the site
}

// A dark screen with one small, waiting light. Tap / click / Enter ignites it and opens the invitation.
export default function Opening({ onStartMusic, onEnter }: Props) {
  const { simple } = useMotion();
  const [lit, setLit] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const ignite = () => {
    if (lit) return;
    onStartMusic();
    setLit(true);
    timers.current.push(window.setTimeout(onEnter, simple ? 500 : 2100));
  };
  const skip = () => {
    onStartMusic();
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ocean" role="dialog" aria-label="Invitation introduction">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(227,190,116,.10), rgba(11,16,14,0) 60%)' }} aria-hidden="true" />

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 1.4, delay: lit ? 0 : 0.4 }} className="absolute top-[14%] px-8 text-center font-display text-3xl font-light italic text-ivory sm:text-5xl">
        Something small
        <br />
        is on the way.
      </motion.p>

      <button
        type="button"
        onClick={ignite}
        disabled={lit}
        aria-label="Light the orb to open the invitation"
        className="group relative flex h-56 w-56 items-center justify-center rounded-full focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-sun disabled:cursor-default sm:h-64 sm:w-64"
      >
        {/* waiting ring */}
        <span className="ambient absolute inset-0 rounded-full border border-sun/50" style={{ animation: lit ? undefined : 'gatePulse 3s ease-in-out infinite' }} aria-hidden="true" />
        <span className="absolute inset-5 rounded-full border border-sun/20" aria-hidden="true" />
        {lit && <span className="absolute inset-0 rounded-full border border-sun" style={{ animation: 'ringPulse 1.6s ease-out forwards' }} aria-hidden="true" />}
        <motion.div className="w-[46%]" animate={lit ? { scale: simple ? 1.6 : 7, opacity: simple ? 1 : 0.0 } : { scale: 1, opacity: 1 }} transition={lit ? { duration: simple ? 0.4 : 1.9, ease: [0.5, 0, 0.7, 0.3] } : { duration: 0.3 }} whileTap={lit ? undefined : { scale: 0.92 }}>
          <OrbBody tone="gold" rings={false} />
        </motion.div>
      </button>

      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FFF1C8_0%,#E3BE74_40%,rgba(227,190,116,0)_75%)]" initial={{ opacity: 0 }} animate={{ opacity: lit ? 0.95 : 0 }} transition={{ duration: simple ? 0.3 : 1.5, delay: lit && !simple ? 0.5 : 0 }} aria-hidden="true" />

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: lit ? 0 : 1 }} transition={{ delay: lit ? 0 : 1.2, duration: 0.8 }} className="absolute bottom-[12%] rounded-full border border-sun/50 px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ivory">
        Tap the light to begin
      </motion.p>

      <button type="button" onClick={skip} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/30 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory hover:bg-white/10">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </div>
  );
}
