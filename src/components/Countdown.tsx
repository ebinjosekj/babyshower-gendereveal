import { AnimatePresence, motion } from 'framer-motion';
import { EVENT } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { Reveal, SectionTitle, Tilt } from './ui';

function Tile({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, '0');
  return (
    <Tilt className="glass rounded-2xl px-2 py-5 text-center sm:px-6 sm:py-8" max={9}>
      <div className="relative h-[1.15em] overflow-hidden font-display text-4xl font-medium sm:text-6xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            className="gold-text block tabular-nums"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-mocha sm:text-xs sm:tracking-[0.4em]">{label}</p>
    </Tilt>
  );
}

export default function Countdown() {
  const t = useCountdown(EVENT.startISO);
  return (
    <section className="relative px-5 py-24 sm:py-32" aria-label="Countdown to the celebration">
      <SectionTitle kicker="The countdown" title="Until we celebrate" sub="Every second brings us closer to the big day." />
      <Reveal delay={0.15} className="mx-auto mt-12 max-w-3xl">
        {t.done ? (
          <p className="gold-text text-center font-script text-6xl">It’s celebration time!</p>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:gap-6" role="timer" aria-live="off">
            <Tile value={t.days} label="Days" />
            <Tile value={t.hours} label="Hours" />
            <Tile value={t.minutes} label="Minutes" />
            <Tile value={t.seconds} label="Seconds" />
          </div>
        )}
      </Reveal>
    </section>
  );
}
