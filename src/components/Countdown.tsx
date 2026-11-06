import { AnimatePresence, motion } from 'framer-motion';
import { EVENT } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Reveal, SectionHead } from './ui';

const UNITS = [
  { label: 'Days', max: 100 },
  { label: 'Hours', max: 24 },
  { label: 'Minutes', max: 60 },
  { label: 'Seconds', max: 60 },
] as const;

// A golden ring: the arc shows how far through the unit we are.
function Ring({ value, max, label, id }: { value: number; max: number; label: string; id: string }) {
  const v = String(value).padStart(2, '0');
  const r = 44;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, value / max);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[150px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7E3A6" />
            <stop offset="1" stopColor="#E98C56" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="rgba(24,61,75,.55)" stroke="rgba(241,232,214,.25)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#ring-${id})`} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: 'stroke-dashoffset .9s ease' }} />
        <circle cx="50" cy="50" r="36" fill="none" stroke="#B8A16A" strokeOpacity=".45" strokeWidth=".6" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative h-[1.05em] overflow-hidden font-display text-4xl font-semibold text-ivory sm:text-5xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={v} className="block tabular-nums" initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              {v}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-sun sm:text-xs">{label}</p>
      </div>
    </div>
  );
}

export default function Countdown() {
  const t = useCountdown(EVENT.startISO);
  const values = [t.days, t.hours, t.minutes, t.seconds];

  return (
    <section id="countdown" aria-label="Countdown" className="relative overflow-hidden px-4 pb-28 pt-28 sm:pt-36" style={{ background: SKY.dusk }}>
      <CloudLayer count={3} seed={111} depth={0.2} top={[2, 30]} />
      <Motes count={22} seed={17} />
      <div className="relative z-10">
        <SectionHead dark kicker="The countdown" title="Every Second Brings Us Closer" sub="Counting down to our little wonder’s celebration." />
        <Reveal delay={0.15} className="mx-auto mt-14 max-w-3xl">
          {t.done ? (
            <p className="text-center font-display text-5xl font-semibold italic text-sun sm:text-7xl" role="status">
              It’s celebration time!
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-6" role="timer" aria-label="Time until the celebration">
              {UNITS.map((u, i) => (
                <Ring key={u.label} id={u.label} value={values[i]} max={u.max} label={u.label} />
              ))}
            </div>
          )}
          <p className="mt-10 text-center font-sans text-sm font-medium uppercase tracking-[0.3em] text-champagne">
            {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venueName}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
