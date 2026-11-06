import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { EVENT } from '../config';
import { Reveal } from './ui';

// The orb behind dims into a single point of light as we reach the end.
export default function Finale({ onReplay }: { onReplay: () => void }) {
  return (
    <section id="finale" aria-label="Closing" className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-28 text-center">
      <Reveal>
        <p className="font-sans text-xs font-medium uppercase tracking-[0.5em] text-sun">With love</p>
        <h2 className="mt-5 font-display text-6xl font-light leading-[0.98] text-ivory [text-shadow:0_4px_40px_rgba(0,0,0,.8)] sm:text-9xl">
          See you on
          <span className="block italic text-sun">November 21.</span>
        </h2>
        <p className="mt-8 font-display text-3xl font-light italic text-ivory sm:text-4xl">{EVENT.parents}</p>
        <p className="mt-4 font-sans text-xs font-medium uppercase tracking-[0.35em] text-champagne">
          {EVENT.timeLabel} · {EVENT.venueName}
        </p>
      </Reveal>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 1 }} className="mt-14">
        <button type="button" onClick={onReplay} className="btn-ghost-light">
          <RotateCcw size={16} aria-hidden="true" /> Replay
        </button>
      </motion.div>
    </section>
  );
}
