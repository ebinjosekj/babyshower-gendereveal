import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { scrollToId } from '../lib/scroll';

const LINKS: [string, string][] = [
  ['top', 'Welcome'],
  ['countdown', 'Countdown'],
  ['reveal', 'Join a Team'],
  ['details', 'Celebration Details'],
  ['rsvp', 'RSVP'],
];

export default function Nav({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const { simple, toggleSimple } = useMotion();
  if (!visible) return null;

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToId(id), 150);
  };

  return (
    <nav aria-label="Sections" className="fixed left-3 top-3 z-[60]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="glass flex h-12 w-12 items-center justify-center rounded-full text-plum"
      >
        <motion.span key={String(open)} initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="flex">{open ? <X size={20} /> : <Menu size={20} />}</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="glass mt-2 w-60 rounded-3xl p-2"
          >
            {LINKS.map(([id, label], i) => (
              <motion.li key={id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.045, duration: 0.35, ease: 'easeOut' }}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  className="nav-item w-full rounded-2xl px-4 py-3 text-left font-display text-base text-plum hover:bg-sun/30"
                >
                  {label}
                </button>
              </motion.li>
            ))}
            <li className="mt-1 border-t border-champagne/70 pt-1">
              <button
                type="button"
                onClick={toggleSimple}
                aria-pressed={simple}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-display text-sm text-ink-soft hover:bg-sun/30"
              >
                <span className="flex items-center gap-2">
                  <Zap size={16} aria-hidden="true" /> Simplified animations
                </span>
                <span className="rounded-full bg-champagne/60 px-2 py-0.5 text-xs font-semibold text-plum">{simple ? 'On' : 'Off'}</span>
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}
