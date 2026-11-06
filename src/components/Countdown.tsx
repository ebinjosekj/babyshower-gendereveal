import { AnimatePresence, motion } from 'framer-motion';
import { EVENT } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { Moon, Star } from './art';
import { Reveal, SectionHead, StarField } from './ui';

const GEMS = [
  { label: 'Days', from: '#FFF4B8', to: '#FF9A3C', glow: 'rgba(255,154,60,.7)' },
  { label: 'Hours', from: '#C9F7E6', to: '#1FA67A', glow: 'rgba(31,166,122,.7)' },
  { label: 'Minutes', from: '#E6DDFB', to: '#8E74E0', glow: 'rgba(142,116,224,.75)' },
  { label: 'Seconds', from: '#FFE0D6', to: '#FF7A66', glow: 'rgba(255,122,102,.7)' },
] as const;

function Crystal({ value, gem, index }: { value: number; gem: (typeof GEMS)[number]; index: number }) {
  const v = String(value).padStart(2, '0');
  return (
    <div
      className="ambient animate-floaty"
      style={{ animationDelay: `${index * 0.7}s`, animationDuration: `${5 + index * 0.4}s`, filter: `drop-shadow(0 18px 24px ${gem.glow})` }}
    >
      <div
        className="relative flex aspect-[4/5] flex-col items-center justify-center"
        style={{
          clipPath: 'polygon(50% 0, 100% 22%, 100% 78%, 50% 100%, 0 78%, 0 22%)',
          background: `linear-gradient(150deg, ${gem.from} 0%, ${gem.to} 100%)`,
        }}
      >
        {/* facets */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.55)_0%,rgba(255,255,255,0)_38%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(300deg,rgba(43,26,87,.28)_0%,rgba(43,26,87,0)_45%)]" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 h-1/2 w-px bg-white/40" aria-hidden="true" />
        <div className="relative h-[1.1em] overflow-hidden font-display text-4xl font-semibold text-plum sm:text-6xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={v}
              className="block tabular-nums drop-shadow-[0_2px_0_rgba(255,255,255,.6)]"
              initial={{ y: '100%', opacity: 0, rotateX: -70 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              {v}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="relative mt-1 font-display text-[10px] uppercase tracking-[0.25em] text-plum/80 sm:text-xs sm:tracking-[0.35em]">{gem.label}</p>
      </div>
    </div>
  );
}

export default function Countdown() {
  const t = useCountdown(EVENT.startISO);
  const values = [t.days, t.hours, t.minutes, t.seconds];

  return (
    <section
      id="countdown"
      aria-label="Countdown"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#8EE3C2_0%,#8E74E0_14%,#4A2A8C_55%,#2B1A57_100%)] px-4 pb-28 pt-32 sm:pt-40"
    >
      <StarField count={60} />
      <Moon className="ambient animate-floaty absolute right-[7%] top-[14%] w-14 drop-shadow-[0_0_24px_rgba(255,224,138,.8)] sm:w-24" />
      <Star className="ambient absolute left-[10%] top-[22%] w-5" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />

      <div className="relative z-10">
        <SectionHead
          dark
          kicker="The magical countdown"
          title="Every Second Brings Us Closer!"
          sub="The countdown to our little wonder begins."
        />
        <Reveal delay={0.15} className="mx-auto mt-14 max-w-3xl">
          {t.done ? (
            <p className="title-grad text-center font-script text-6xl sm:text-8xl">It’s celebration time!</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-6" role="timer" aria-label="Time until the celebration">
              {GEMS.map((g, i) => (
                <Crystal key={g.label} gem={g} value={values[i]} index={i} />
              ))}
            </div>
          )}
          <p className="mt-10 text-center font-display text-sm uppercase tracking-[0.3em] text-champagne">
            {EVENT.dateLabel} · {EVENT.timeLabel}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
