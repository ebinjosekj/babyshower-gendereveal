import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Balloon, CastleIsland, Cumulus, HeroIsland, Mist, RainbowArch } from './world';

interface Props {
  onStartMusic: () => void; // runs inside a user gesture
  onEnter: () => void; // opening finished → show the site
}

const BALLOONS = [
  { l: '8%', t: '24%', w: 70, dur: 9, colors: ['#E98C56', '#F1E8D6'], delay: 2.6, behind: false },
  { l: '78%', t: '20%', w: 84, dur: 11, colors: ['#8974BD', '#F1E8D6'], delay: 3.0, behind: false },
  { l: '62%', t: '40%', w: 38, dur: 13, colors: ['#347D76', '#F0B94B'], delay: 3.4, behind: true },
  { l: '24%', t: '44%', w: 30, dur: 15, colors: ['#F0B94B', '#F1E8D6'], delay: 3.8, behind: true },
];

export default function Opening({ onStartMusic, onEnter }: Props) {
  const { simple } = useMotion();
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const k = simple ? 0.25 : 1;

  useEffect(() => {
    const t = timers.current;
    t.push(window.setTimeout(() => setReady(true), simple ? 500 : 3800));
    return () => t.forEach((id) => window.clearTimeout(id));
  }, [simple]);

  const enter = () => {
    onStartMusic();
    setLeaving(true);
    timers.current.push(window.setTimeout(onEnter, simple ? 250 : 1400));
  };
  const skip = () => {
    onStartMusic();
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: SKY.dawn }} role="dialog" aria-label="Invitation introduction">
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 58%' }}
        initial={{ scale: simple ? 1 : 1.18 }}
        animate={leaving ? { scale: 3.2, opacity: 0 } : { scale: 1 }}
        transition={leaving ? { duration: 1.3, ease: [0.5, 0, 0.9, 0.4] } : { duration: 9, ease: 'easeOut' }}
      >
        {/* warm light behind the island */}
        <div className="absolute inset-x-0 top-[34%] h-[60%]" style={{ background: 'radial-gradient(ellipse at 50% 55%,rgba(240,185,75,.55),rgba(240,185,75,0) 62%)' }} aria-hidden="true" />
        <Motes count={22} seed={3} />
        <CloudLayer count={3} seed={2} depth={0.2} top={[8, 40]} />

        {/* rainbow appears behind the island */}
        <motion.div className="absolute left-1/2 top-[27%] w-[150vw] max-w-[1100px] -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 0.95 }} transition={{ delay: 1.6 * k, duration: 1.6 }} aria-hidden="true">
          <RainbowArch draw={!simple} className="w-full" />
        </motion.div>

        {/* distant islands */}
        <motion.div className="absolute left-[-6%] top-[40%] w-[34%] max-w-[220px] opacity-60" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 1.2 * k, duration: 2 }} aria-hidden="true">
          <div className="ambient" style={{ animation: 'bob 12s ease-in-out infinite' }}>
            <CastleIsland className="w-full" />
          </div>
        </motion.div>

        {/* balloons: different distances, independent drift */}
        {BALLOONS.filter((b) => b.behind).map((b, i) => (
          <motion.div key={`b${i}`} className="absolute" style={{ left: b.l, top: b.t, width: b.w }} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 0.85, y: 0 }} transition={{ delay: b.delay * k, duration: 1.6 }} aria-hidden="true">
            <div className="ambient" style={{ animation: `bob ${b.dur}s ease-in-out infinite` }}>
              <Balloon className="w-full" colors={b.colors} />
            </div>
          </motion.div>
        ))}

        {/* the island rises out of the clouds */}
        <motion.div
          className="absolute bottom-[10%] left-1/2 w-[min(96vw,560px)] -translate-x-1/2"
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 * k, duration: 2.4 * k + 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="ambient" style={{ animation: 'bob 9s ease-in-out infinite' }}>
            <HeroIsland className="w-full drop-shadow-[0_30px_40px_rgba(10,35,45,.55)]" />
          </div>
        </motion.div>

        {BALLOONS.filter((b) => !b.behind).map((b, i) => (
          <motion.div key={`f${i}`} className="absolute" style={{ left: b.l, top: b.t, width: b.w }} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: b.delay * k, duration: 1.8 }} aria-hidden="true">
            <div className="ambient" style={{ animation: `bob ${b.dur}s ease-in-out infinite` }}>
              <Balloon className="w-full" colors={b.colors} />
            </div>
          </motion.div>
        ))}

        <CloudLayer count={3} seed={9} depth={0.8} top={[62, 92]} />
        <Mist className="absolute inset-x-0 bottom-0 h-[22%] w-full" />
      </motion.div>

      {/* camera travels forward through the clouds at the start */}
      {!simple && (
        <>
          <motion.div className="pointer-events-none absolute left-[-20%] top-[10%] w-[90%]" initial={{ scale: 1.2, opacity: 1 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 3.2, ease: 'easeIn' }} aria-hidden="true">
            <Cumulus className="w-full" />
          </motion.div>
          <motion.div className="pointer-events-none absolute right-[-30%] top-[40%] w-[100%]" initial={{ scale: 1.2, opacity: 1 }} animate={{ scale: 4.5, opacity: 0 }} transition={{ duration: 3.4, ease: 'easeIn' }} aria-hidden="true">
            <Cumulus className="w-full" />
          </motion.div>
        </>
      )}

      {/* title */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[7%] px-5 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={leaving ? { opacity: 0 } : { opacity: 1, y: 0 }}
        transition={{ delay: leaving ? 0 : 3.0 * k, duration: leaving ? 0.4 : 1.4 }}
      >
        <h1 className="font-display text-[11vw] font-semibold uppercase leading-[1.02] tracking-[0.04em] text-ivory [text-shadow:0_3px_24px_rgba(10,35,45,.65)] sm:text-6xl">
          A Little Wonder
          <br />
          <span className="text-sun">Is On The Way!</span>
        </h1>
        <p className="mt-3 font-sans text-sm font-medium uppercase tracking-[0.4em] text-ivory [text-shadow:0_2px_12px_rgba(10,35,45,.7)] sm:text-base">{EVENT.parents}</p>
        <p className="mt-1 font-sans text-xs font-medium uppercase tracking-[0.4em] text-ivory/90 [text-shadow:0_2px_12px_rgba(10,35,45,.7)]">21 November 2026</p>
      </motion.div>

      {ready && !leaving && (
        <motion.div className="absolute inset-x-0 bottom-[5%] flex flex-col items-center gap-3 px-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <button type="button" onClick={enter} className="btn-sun !px-8 text-base" autoFocus>
            Enter our wonderland
          </button>
        </motion.div>
      )}

      <button type="button" onClick={skip} className="absolute right-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ivory/50 bg-ocean/40 px-4 text-xs font-medium uppercase tracking-[0.18em] text-ivory backdrop-blur hover:bg-ocean/60">
        <SkipForward size={14} aria-hidden="true" /> Skip introduction
      </button>
    </div>
  );
}
