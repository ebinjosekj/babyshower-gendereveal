import { motion } from 'framer-motion';
import { EVENT } from '../config';
import { scrollToTop } from '../lib/scroll';
import { Balloon, Moon, Star, Teddy } from './Illustrations';
import { Reveal } from './ui';

export default function Closing() {
  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,transparent_0%,#EAD9B6_100%)] px-5 pb-12 pt-28 text-center"
      aria-label="Closing"
    >
      {/* rising stars */}
      {[10, 28, 52, 74, 90].map((l, i) => (
        <motion.div
          key={l}
          className="absolute bottom-0"
          style={{ left: `${l}%` }}
          initial={{ y: 0, opacity: 0 }}
          whileInView={{ y: -260 - i * 40, opacity: [0, 1, 0] }}
          viewport={{ once: false }}
          transition={{ duration: 7 + i, repeat: Infinity, delay: i * 0.9, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <Star className="h-4 w-4" />
        </motion.div>
      ))}

      <Reveal>
        <Moon className="mx-auto h-16 w-16 drop-shadow-[0_0_24px_rgba(232,211,160,.9)]" />
        <p className="gold-text mt-6 font-script text-6xl sm:text-8xl">With love</p>
        <p className="mt-2 font-display text-3xl text-cocoa sm:text-4xl">{EVENT.parents}</p>
        <p className="mx-auto mt-5 max-w-md font-display text-xl italic text-mocha">
          We can’t wait to celebrate this little miracle with you.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="relative mx-auto mt-12 flex max-w-xs items-end justify-center gap-4">
        <Balloon className="w-10" />
        <Teddy className="w-32" />
        <Balloon pearl className="w-9" />
      </Reveal>

      <Reveal delay={0.15} className="mt-12">
        <p className="kicker">Questions? Just call</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {EVENT.contacts.map((c) => (
            <a key={c.tel} className="btn-ghost" href={`tel:${c.tel}`}>
              {c.name} · {c.display}
            </a>
          ))}
        </div>
        <button type="button" className="btn-gold mt-10" onClick={scrollToTop}>
          Back to the beginning
        </button>
      </Reveal>

      <p className="mt-14 text-[11px] uppercase tracking-[0.4em] text-mocha/80">
        Made with love · {EVENT.dateLabel.replace('Saturday, ', '')}
      </p>
    </section>
  );
}
