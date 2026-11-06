import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { scrollToId } from '../lib/scroll';

const LINKS: [string, string][] = [
  ['adventure', 'Our Adventure'],
  ['countdown', 'Countdown'],
  ['world', 'Wonder World'],
  ['reveal', 'Make a Prediction'],
  ['details', 'Event Details'],
  ['rsvp', 'RSVP'],
  ['memories', 'Memories'],
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
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="glass mt-2 w-60 rounded-3xl p-2"
          >
            {LINKS.map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  className="w-full rounded-2xl px-4 py-3 text-left font-display text-base text-plum hover:bg-sun/30"
                >
                  {label}
                </button>
              </li>
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
