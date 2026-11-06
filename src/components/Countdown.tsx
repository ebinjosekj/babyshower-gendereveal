import { AnimatePresence, motion } from 'framer-motion';
import { EVENT } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { Reveal, SectionHead } from './ui';

const UNITS = [
  { label: 'Days', max: 100 },
  { label: 'Hours', max: 24 },
  { label: 'Minutes', max: 60 },
  { label: 'Seconds', max: 60 },
] as const;

// A hairline orbit: the glowing dot sits at how far through the unit we are.
function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const v = String(value).padStart(2, '0');
  const frac = Math.min(1, value / max);
  const a = frac * Math.PI * 2 - Math.PI / 2;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[150px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden="true" fill="none">
        <circle cx="50" cy="50" r="46" stroke="#E3BE74" strokeOpacity=".25" strokeWidth=".6" />
        <circle cx="50" cy="50" r="46" stroke="#E3BE74" strokeWidth="1" strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - frac)} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset .9s ease' }} />
        <circle cx={50 + Math.cos(a) * 46} cy={50 + Math.sin(a) * 46} r="2.2" fill="#FFE9A8" style={{ filter: 'drop-shadow(0 0 3px #E3BE74)', transition: 'all .9s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative h-[1.05em] overflow-hidden font-display text-4xl font-light text-ivory sm:text-5xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={v} className="block tabular-nums" initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              {v}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-0.5 font-sans text-[9px] font-medium uppercase tracking-[0.25em] text-sun sm:text-[11px]">{label}</p>
      </div>
    </div>
  );
}

export default function Countdown() {
  const t = useCountdown(EVENT.startISO);
  const values = [t.days, t.hours, t.minutes, t.seconds];
  return (
    <section id="countdown" aria-label="Countdown" className="relative px-4 py-28 sm:py-36">
      <SectionHead dark kicker="The countdown" title="Every second brings us closer" />
      <Reveal delay={0.15} className="mx-auto mt-14 max-w-3xl">
        {t.done ? (
          <p className="text-center font-display text-5xl font-light italic text-sun sm:text-7xl" role="status">
            It’s celebration time.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-6" role="timer" aria-label="Time until the celebration">
            {UNITS.map((u, i) => (
              <Ring key={u.label} value={values[i]} max={u.max} label={u.label} />
            ))}
          </div>
        )}
        <p className="mt-10 text-center font-sans text-xs font-medium uppercase tracking-[0.35em] text-champagne">
          {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venueName}
        </p>
      </Reveal>
    </section>
  );
}
