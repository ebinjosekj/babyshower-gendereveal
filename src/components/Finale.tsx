import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Balloon, Mist, Spark } from './world';

// A single light, then a constellation, then a glide through colourful clouds.
const PTS: [number, number][] = [
  [50, 46], [34, 32], [20, 40], [14, 58], [30, 66], [48, 72], [66, 66], [82, 58], [86, 40], [72, 30], [58, 20],
];
const LINKS = PTS.slice(0, -1).map((p, i) => [p, PTS[i + 1]] as const);

const LINES = ['One little wonder.', 'Infinite love.', 'A universe of dreams.'];

export default function Finale({ onReplay }: { onReplay: () => void }) {
  const { simple } = useMotion();
  const d = simple ? 0.05 : 1;

  return (
    <section id="finale" aria-label="Closing" className="relative overflow-hidden">
      {/* 1 · lights */}
      <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden" style={{ background: SKY.night }}>
        <Motes count={26} seed={41} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {LINKS.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke="#F0B94B"
              strokeOpacity=".7"
              strokeWidth=".25"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.9 * d, delay: (1.2 + i * 0.35) * d }}
            />
          ))}
          {PTS.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={i === 0 ? 1.5 : 0.8}
              fill="#FFE9A8"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.6 * d, delay: (i === 0 ? 0 : 0.9 + i * 0.35) * d }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center', filter: 'drop-shadow(0 0 1.2px #F0B94B)' }}
            />
          ))}
        </svg>
        <motion.p
          className="relative z-10 px-6 text-center font-display text-3xl italic text-ivory [text-shadow:0_2px_20px_rgba(0,0,0,.5)] sm:text-5xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-30%' }}
          transition={{ delay: 4.6 * d, duration: 1.4 }}
        >
          A single light became a universe.
        </motion.p>
      </div>

      {/* 2 · through colourful clouds, then the message */}
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-24 text-center" style={{ background: 'linear-gradient(180deg,#263B42 0%,#347D76 22%,#77B7B0 48%,#F0D9A0 78%,#F0B94B 100%)' }}>
        <CloudLayer count={4} seed={171} depth={0.5} top={[0, 60]} />
        <Balloon className="ambient absolute left-[8%] bottom-[12%] w-14 sm:w-20" colors={['#E98C56', '#F1E8D6']} style={{ animation: 'bob 10s ease-in-out infinite' }} />
        <Balloon className="ambient absolute right-[8%] bottom-[22%] w-12 sm:w-16" colors={['#8974BD', '#F0B94B']} style={{ animation: 'bob 12s ease-in-out -3s infinite' }} />
        <Motes count={14} seed={47} />

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-semibold uppercase leading-[1.15] tracking-[0.03em] text-ivory [text-shadow:0_3px_22px_rgba(10,35,45,.65)] sm:text-6xl">
            {LINES.map((l, i) => (
              <motion.span key={l} className="block" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-15%' }} transition={{ duration: 0.9, delay: i * 0.5 * d }}>
                {l}
              </motion.span>
            ))}
          </h2>
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-15%' }} transition={{ duration: 1, delay: 1.8 * d }}>
            <Spark className="mx-auto mt-8 w-6" />
            <p className="mx-auto mt-5 max-w-md font-display text-2xl italic text-ocean sm:text-3xl">We cannot wait to celebrate with you.</p>
            <p className="mt-6 font-display text-xl font-medium text-ocean sm:text-2xl">With love,</p>
            <p className="font-display text-4xl font-semibold italic text-ocean sm:text-6xl">{EVENT.parents}</p>
            <p className="mt-6 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ocean/85">
              {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venueName}
            </p>
            <button type="button" onClick={onReplay} className="btn-sun mt-9">
              <RotateCcw size={18} aria-hidden="true" /> Replay our journey
            </button>
          </motion.div>
        </div>
        <Mist className="absolute inset-x-0 bottom-0 h-[12%] w-full" />
      </div>
    </section>
  );
}
