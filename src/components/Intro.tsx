import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { EVENT } from '../config';
import TwinLights from './TwinLights';
import { scrollToId } from '../lib/scroll';

const LINES = ['Two hearts.', 'One new beginning.', 'A little wonder, on the way.'];

// Hero + three big statements, floating over the page-long orb.
export default function Intro() {
  return (
    <>
      <section id="top" aria-label="Welcome" className="relative flex min-h-[100svh] flex-col items-center justify-end px-5 pb-[9svh] text-center">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1.2 }} className="rounded-full border border-sun/50 bg-ocean/70 px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.4em] text-ivory shadow-[0_8px_30px_-8px_rgba(0,0,0,.8)] backdrop-blur-md [text-shadow:0_1px_6px_rgba(0,0,0,.9)] sm:text-xs">
          {EVENT.title}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1.3, ease: [0.22, 1, 0.36, 1] }} className="mt-5 font-display text-[15vw] font-light leading-[0.95] tracking-[-0.01em] text-ivory [text-shadow:0_4px_40px_rgba(0,0,0,.7)] sm:text-8xl">
          Nikki
          <span className="gold-text ambient block italic [filter:drop-shadow(0_2px_14px_rgba(0,0,0,.85))]">&amp; Ebin</span>
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1.2 }} className="mt-8">
          <TwinLights />
        </motion.div>
        <button type="button" onClick={() => scrollToId('story')} aria-label="Scroll down" className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/30 text-ivory">
          <ChevronDown size={22} className="ambient" style={{ animation: 'bob 2.4s ease-in-out infinite' }} />
        </button>
      </section>

      <section id="story" aria-label="Our story" className="relative">
        {LINES.map((l, i) => (
          <div key={l} className="flex min-h-[72svh] items-center justify-center px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, margin: '-30% 0px' }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className={`max-w-3xl font-display text-5xl font-light leading-[1.05] text-ivory [text-shadow:0_4px_40px_rgba(0,0,0,.85)] sm:text-8xl ${i === 1 ? 'italic text-sun' : ''}`}
            >
              {l}
            </motion.p>
          </div>
        ))}
        <p className="sr-only">{EVENT.intro}</p>
      </section>
    </>
  );
}
