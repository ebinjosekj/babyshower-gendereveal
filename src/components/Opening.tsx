import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import { EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { Butterfly, Cloud, HotAirBalloon, Island, Moon, Rainbow, Star, Tree } from './art';
import { StarField } from './ui';

interface Props {
  onStartMusic: () => void; // runs inside a user gesture (door / enter / skip)
  onEnter: () => void; // opening is finished → show the site
}

type Stage = 'closed' | 'opening' | 'world';

const leaf = (side: 'l' | 'r') => ({
  background:
    'linear-gradient(135deg,#FFF1B0 0%,#F5C84C 35%,#C9962E 70%,#F0CE6A 100%)',
  boxShadow:
    'inset 0 0 0 3px rgba(255,248,234,.35), inset 0 0 22px rgba(120,80,10,.45), 0 0 40px rgba(255,201,60,.35)',
  borderRadius: side === 'l' ? '999px 0 0 0' : '0 999px 0 0',
});

export default function Opening({ onStartMusic, onEnter }: Props) {
  const { simple } = useMotion();
  const [stage, setStage] = useState<Stage>('closed');
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: simple ? 10 : 30 }, (_, i) => {
        const a = (i / (simple ? 10 : 30)) * Math.PI * 2 + Math.random();
        const d = 25 + Math.random() * 55;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 0.5 + Math.random() * 1.4, delay: Math.random() * 0.9 };
      }),
    [simple],
  );

  const openDoor = () => {
    if (stage !== 'closed') return;
    onStartMusic();
    setStage('opening');
    timers.current.push(window.setTimeout(() => setStage('world'), simple ? 1300 : 3700));
  };

  const enter = () => {
    onStartMusic();
    setLeaving(true);
    timers.current.push(window.setTimeout(onEnter, simple ? 250 : 1000));
  };

  const skip = () => {
    onStartMusic();
    onEnter();
  };

  const door = stage !== 'closed';
  const showDoorScene = stage !== 'world';

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-[radial-gradient(ellipse_at_50%_105%,#6A3FB5_0%,#3A2270_42%,#1B0F3A_100%)]"
      animate={leaving ? { opacity: 0, scale: simple ? 1 : 1.12 } : { opacity: 1, scale: 1 }}
      transition={{ duration: simple ? 0.25 : 1, ease: 'easeInOut' }}
      role="dialog"
      aria-label="Invitation opening"
    >
      <StarField count={70} />
      <Moon className="absolute right-[9%] top-[7%] w-16 drop-shadow-[0_0_26px_rgba(255,224,138,.9)] sm:w-24" />

      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-4 z-30 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 font-display text-xs uppercase tracking-[0.2em] text-ivory backdrop-blur hover:bg-white/20"
      >
        Skip intro <SkipForward size={14} aria-hidden="true" />
      </button>

      {/* ---------- scene 1: the golden door ---------- */}
      {showDoorScene && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.p
            className="mb-8 text-center font-display text-sm uppercase tracking-[0.5em] text-champagne"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'closed' ? 1 : 0 }}
            transition={{ duration: 0.8, delay: stage === 'closed' ? 0.5 : 0 }}
          >
            You are invited
          </motion.p>

          <div style={{ perspective: 1200 }} className="relative">
            {/* glow */}
            <motion.div
              aria-hidden="true"
              className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,201,60,.55)_0%,rgba(255,201,60,0)_68%)]"
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <button
              type="button"
              onClick={openDoor}
              aria-label="Open the golden door"
              className="relative block h-[min(58vh,420px)] w-[min(62vw,290px)] rounded-t-[999px] border-[10px] border-[#E8C76A] bg-[#FFF8EA] shadow-[0_0_60px_rgba(255,201,60,.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-sun"
              style={{ transformStyle: 'preserve-3d' }}
              disabled={door}
            >
              {/* light behind the door */}
              <div className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-[radial-gradient(circle_at_50%_60%,#FFFFFF_0%,#FFF1B0_35%,#FFC93C_80%)]" />
              <motion.div
                className="absolute inset-y-0 left-0 w-1/2 origin-left"
                style={leaf('l')}
                animate={{ rotateY: door ? -112 : 0 }}
                transition={{ duration: simple ? 0.6 : 1.8, ease: [0.65, 0, 0.35, 1] }}
              >
                <span className="absolute right-3 top-1/2 h-4 w-4 rounded-full bg-[#FFF8EA] shadow-[0_0_8px_rgba(255,248,234,.9)]" />
                <span className="absolute inset-x-5 top-[18%] bottom-[10%] rounded-t-[999px] border-2 border-[#FFF1B0]/60" />
              </motion.div>
              <motion.div
                className="absolute inset-y-0 right-0 w-1/2 origin-right"
                style={leaf('r')}
                animate={{ rotateY: door ? 112 : 0 }}
                transition={{ duration: simple ? 0.6 : 1.8, ease: [0.65, 0, 0.35, 1] }}
              >
                <span className="absolute left-3 top-1/2 h-4 w-4 rounded-full bg-[#FFF8EA] shadow-[0_0_8px_rgba(255,248,234,.9)]" />
                <span className="absolute inset-x-5 top-[18%] bottom-[10%] rounded-t-[999px] border-2 border-[#FFF1B0]/60" />
              </motion.div>
            </button>
          </div>

          <motion.p
            className="mt-8 font-display text-lg text-ivory/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'closed' ? [0.45, 1, 0.45] : 0 }}
            transition={stage === 'closed' ? { duration: 2.4, repeat: Infinity, delay: 1 } : { duration: 0.3 }}
          >
            Tap the golden door
          </motion.p>
        </div>
      )}

      {/* ---------- golden light floods the screen ---------- */}
      {door && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[40vmax] w-[40vmax] -ml-[20vmax] -mt-[20vmax] rounded-full bg-[radial-gradient(circle,#FFFFFF_0%,#FFF4B8_35%,#FFC93C_65%,rgba(255,201,60,0)_72%)]"
          initial={{ scale: 0.05, opacity: 0 }}
          animate={{ scale: [0.05, 0.2, 3.2], opacity: [0, 1, 1] }}
          transition={{ duration: simple ? 1 : 2.6, delay: simple ? 0 : 1.2, times: [0, 0.3, 1], ease: 'easeIn' }}
        />
      )}

      {/* ---------- magical particles drift toward the viewer ---------- */}
      {stage === 'opening' &&
        particles.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#FFF4B8] shadow-[0_0_10px_3px_rgba(255,236,160,.9)]"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: `${p.x}vw`, y: `${p.y}vh`, scale: [0, p.s * 2, p.s * 4], opacity: [0, 1, 0] }}
            transition={{ duration: 2.2, delay: 1 + p.delay, ease: 'easeOut' }}
          />
        ))}

      {/* ---------- camera travels through the clouds ---------- */}
      {stage === 'opening' &&
        !simple &&
        [
          { x: '-30vw', y: '-12vh', d: 1.6 },
          { x: '32vw', y: '-6vh', d: 1.9 },
          { x: '-34vw', y: '16vh', d: 2.2 },
          { x: '30vw', y: '20vh', d: 2.5 },
          { x: '0vw', y: '-24vh', d: 2.8 },
        ].map((c, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[46vw] max-w-[420px] -ml-[23vw] -mt-[10vw]"
            initial={{ scale: 0.15, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: [0.15, 1.6, 4], opacity: [0, 0.95, 0], x: c.x, y: c.y }}
            transition={{ duration: 1.8, delay: c.d, ease: 'easeIn' }}
          >
            <Cloud className="w-full" />
          </motion.div>
        ))}

      {/* ---------- scene 2: the colourful fantasy world ---------- */}
      {stage === 'world' && (
        <motion.div
          className="absolute inset-0 overflow-y-auto bg-[linear-gradient(180deg,#B8A6F0_0%,#FFD6A8_42%,#FFF1C9_68%,#8EE3C2_100%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: simple ? 0.3 : 1.4 }}
        >
          <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-20 text-center">
            <Rainbow className="pointer-events-none absolute left-1/2 top-[6%] w-[130%] max-w-[900px] -translate-x-1/2 opacity-80" />
            <Cloud className="ambient pointer-events-none absolute left-0 top-[14%] w-40 opacity-90 sm:w-64" style={{ animation: 'drift 80s linear infinite' }} />
            <Cloud className="ambient pointer-events-none absolute left-0 top-[48%] w-52 sm:w-80" style={{ animation: 'drift 62s linear -25s infinite' }} />
            <HotAirBalloon className="ambient absolute left-[5%] top-[20%] w-14 animate-floaty sm:left-[12%] sm:w-24" />
            <HotAirBalloon
              colors={['#8EE3C2', '#B8A6F0', '#FFC93C', '#FF9A3C', '#27C4C4']}
              className="ambient absolute right-[6%] top-[30%] w-12 animate-floaty sm:right-[14%] sm:w-20"
              style={{ animationDelay: '1.4s' }}
            />
            <div className="ambient pointer-events-none absolute left-0 top-[36%]" style={{ animation: 'flyAcross 22s linear infinite' }}>
              <Butterfly className="w-9" />
            </div>
            <div className="ambient pointer-events-none absolute left-0 top-[58%]" style={{ animation: 'flyBack 28s linear -9s infinite' }}>
              <Butterfly className="w-7" a="#27C4C4" b="#FFC93C" />
            </div>
            {[
              ['12%', '10%'],
              ['86%', '12%'],
              ['70%', '4%'],
              ['28%', '6%'],
            ].map(([l, t], i) => (
              <Star key={i} className="ambient absolute w-4" style={{ left: l, top: t, animation: `twinkle 3s ease-in-out ${i * 0.6}s infinite` }} />
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-[min(92vw,520px)] opacity-95">
              <Island className="w-full" />
              <Tree className="absolute bottom-[58%] left-[20%] w-[12%]" />
              <Tree className="absolute bottom-[56%] right-[18%] w-[10%]" c1="#FF9A3C" c2="#FFC93C" />
            </div>

            <div className="relative z-10">
              <motion.h1
                className="font-display text-[11vw] font-semibold uppercase leading-[1.02] tracking-wide text-plum drop-shadow-[0_3px_0_rgba(255,248,234,.9)] sm:text-6xl md:text-7xl"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                A Little Wonder
                <br />
                <span className="title-grad">Is On The Way!</span>
              </motion.h1>
              <motion.p
                className="title-grad mt-4 font-script text-6xl sm:text-8xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
              >
                {EVENT.parents}
              </motion.p>
              <motion.p
                className="mx-auto mt-4 max-w-md text-base font-semibold leading-relaxed text-ink sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.3 }}
              >
                {EVENT.subtitle}
              </motion.p>
              <motion.button
                type="button"
                onClick={enter}
                className="btn-sun mt-8 !px-8 !py-4 text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.7 }}
                whileTap={{ scale: 0.96 }}
              >
                Enter our wonder world
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
