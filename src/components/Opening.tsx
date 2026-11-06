import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { CloudLayer, Motes, SKY } from './atmosphere';
import Gate from './Gate';
import { Balloon, CastleIsland, Mist, RainbowArch } from './world';

interface Props {
  onStartMusic: () => void; // runs inside a user gesture
  onEnter: () => void; // opening finished → show the site
}

type Stage = 'closed' | 'open' | 'through';

export default function Opening({ onStartMusic, onEnter }: Props) {
  const { simple } = useMotion();
  const [stage, setStage] = useState<Stage>('closed');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: simple ? 6 : 16 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        const d = 120 + Math.random() * 220;
        return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8 + 60, s: 3 + Math.random() * 4, delay: Math.random() * 0.9, dur: 1.6 + Math.random(), k: i };
      }),
    [simple],
  );

  // click / tap / Enter / Space on the gate
  const openGate = () => {
    if (stage !== 'closed') return;
    onStartMusic();
    setStage('open');
    timers.current.push(window.setTimeout(() => setStage('through'), simple ? 500 : 1700));
    timers.current.push(window.setTimeout(onEnter, simple ? 900 : 3300));
  };
  const skip = () => {
    onStartMusic();
    onEnter();
  };

  const through = stage === 'through';
  const opened = stage !== 'closed';

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: SKY.dawn }} role="dialog" aria-label="Invitation introduction">
      <motion.div className="absolute inset-0" style={{ transformOrigin: '50% 54%' }} animate={through ? { scale: 5, opacity: 0 } : { scale: 1, opacity: 1 }} transition={through ? { duration: 1.6, ease: [0.5, 0, 0.9, 0.5] } : { duration: 0.2 }}>
        {/* twilight sky: stars, glow, clouds, distant lit islands */}
        <Motes count={26} seed={3} />
        <div className="absolute inset-x-0 top-[30%] h-[60%]" style={{ background: 'radial-gradient(ellipse at 50% 60%,rgba(240,185,75,.4),rgba(240,185,75,0) 62%)' }} aria-hidden="true" />
        <CloudLayer count={3} seed={2} depth={0.2} top={[8, 40]} />
        <div className="absolute left-1/2 top-[24%] w-[150vw] max-w-[1100px] -translate-x-1/2 opacity-55" aria-hidden="true">
          <RainbowArch className="w-full" />
        </div>
        <div className="absolute left-[-8%] top-[36%] w-[36%] max-w-[230px] opacity-70" aria-hidden="true">
          <div className="ambient" style={{ animation: 'bob 12s ease-in-out infinite' }}>
            <CastleIsland className="w-full" />
          </div>
        </div>
        <div className="absolute right-[-10%] top-[48%] w-[30%] max-w-[190px] opacity-60" aria-hidden="true">
          <div className="ambient" style={{ animation: 'bob 14s ease-in-out -5s infinite' }}>
            <CastleIsland className="w-full" />
          </div>
        </div>
        <Balloon className="ambient absolute left-[6%] top-[22%] w-14 sm:w-20" colors={['#E98C56', '#F1E8D6']} style={{ animation: 'bob 9s ease-in-out infinite' }} />
        <Balloon className="ambient absolute right-[7%] top-[18%] w-16 sm:w-24" colors={['#8974BD', '#F1E8D6']} style={{ animation: 'bob 11s ease-in-out -3s infinite' }} />
        <Balloon className="ambient absolute left-[70%] top-[40%] w-8 opacity-80" colors={['#347D76', '#F0B94B']} style={{ animation: 'bob 13s ease-in-out -6s infinite' }} />

        {/* the gate */}
        <div className="absolute left-1/2 top-[22%] aspect-[4/5] w-[min(86vw,50svh,420px)] -translate-x-1/2">
          <button
            type="button"
            onClick={openGate}
            disabled={opened}
            aria-label="Open the gate to enter Little Wonderland"
            className="group relative block h-full w-full cursor-pointer rounded-[40px] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sun disabled:cursor-default"
          >
            <span className="ambient absolute left-[35%] top-[48%] h-[24%] w-[30%] rounded-full bg-sun/50 blur-2xl" style={{ animation: opened ? undefined : 'gatePulse 2.6s ease-in-out infinite' }} aria-hidden="true" />
            <Gate open={opened} fast={simple} />
          </button>
          {/* glowing particles drift out when the doors open */}
          {opened &&
            particles.map((p) => (
              <span
                key={p.k}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[62%] rounded-full bg-[#FFE9A8]"
                style={{ width: p.s, height: p.s, boxShadow: '0 0 10px 3px rgba(240,185,75,.7)', ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px`, animation: `spill ${p.dur}s ease-out ${0.5 + p.delay}s forwards`, opacity: 0 }}
              />
            ))}
        </div>

        <CloudLayer count={3} seed={9} depth={0.8} top={[78, 98]} />
        <Mist className="absolute inset-x-0 bottom-0 h-[16%] w-full" />
      </motion.div>

      {/* invitation text + visible prompt */}
      <motion.div className="pointer-events-none absolute inset-x-0 top-[8%] px-6 text-center" initial={{ opacity: 0, y: 12 }} animate={opened ? { opacity: 0 } : { opacity: 1, y: 0 }} transition={{ duration: opened ? 0.5 : 1.2, delay: opened ? 0 : 0.4 }}>
        <p className="font-display text-2xl italic leading-snug text-ivory [text-shadow:0_3px_20px_rgba(0,0,0,.7)] sm:text-4xl">
          Nikhitha &amp; Ebin invite you
          <br />
          into <span className="font-semibold not-italic text-sun">Little Wonderland</span>
        </p>
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-x-0 bottom-[5%] flex flex-col items-center px-6" initial={{ opacity: 0 }} animate={opened ? { opacity: 0 } : { opacity: 1 }} transition={{ delay: opened ? 0 : 1.2, duration: 0.8 }}>
        <p className="rounded-full border border-sun/70 bg-ocean/65 px-6 py-3 font-sans text-sm font-medium uppercase tracking-[0.22em] text-ivory backdrop-blur">Tap the gate to open</p>
      </motion.div>

      {/* warm light floods the screen as we pass through */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 54%,#FFF3C4 0%,#FFD275 35%,rgba(240,185,75,0) 75%)' }} initial={{ opacity: 0 }} animate={{ opacity: through ? 0.95 : 0 }} transition={{ duration: 1.2 }} aria-hidden="true" />

      <button type="button" onClick={skip} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/50 bg-ocean/50 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory backdrop-blur hover:bg-ocean/70">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </div>
  );
}
