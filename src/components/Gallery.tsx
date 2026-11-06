import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GALLERY } from '../config';
import { Star } from './Illustrations';
import { Reveal, SectionTitle } from './ui';

const base = import.meta.env.BASE_URL;

export default function Gallery() {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<number | null>(null);

  const items = GALLERY.filter((g) => !failed.has(g.file));
  const markFailed = (file: string) => setFailed((s) => new Set(s).add(file));

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null || items.length === 0 ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  return (
    <section className="px-5 py-20 sm:py-28" aria-label="Photo gallery">
      <SectionTitle kicker="Memories" title="Our moments" sub="A few favourite memories on the way to meeting you." />

      {/* Probe images quietly so missing files never show a broken icon. */}
      <div className="hidden">
        {GALLERY.map((g) => (
          <img key={g.file} src={`${base}gallery/${g.file}`} alt="" onError={() => markFailed(g.file)} />
        ))}
      </div>

      {items.length === 0 ? (
        <Reveal className="mx-auto mt-12 max-w-md text-center">
          <Star className="mx-auto h-5 w-5" />
          <p className="mt-4 font-display text-2xl italic text-mocha">Our favourite photos are coming soon.</p>
        </Reveal>
      ) : (
        <div className="mx-auto mt-12 max-w-5xl columns-2 gap-3 sm:columns-3 sm:gap-5">
          {items.map((g, i) => (
            <Reveal key={g.file} delay={(i % 3) * 0.08} className="mb-3 break-inside-avoid sm:mb-5">
              <motion.button
                type="button"
                onClick={() => setOpen(i)}
                whileHover={{ y: -6, rotateX: 2 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open photo: ${g.caption}`}
                className="group relative block w-full overflow-hidden rounded-2xl border border-gold/40 bg-cream p-1.5 shadow-[0_20px_40px_-20px_rgba(110,86,64,.5)]"
              >
                <img
                  src={`${base}gallery/${g.file}`}
                  alt={g.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <span className="pointer-events-none absolute inset-x-1.5 bottom-1.5 rounded-b-xl bg-gradient-to-t from-cocoa/60 to-transparent px-3 pb-2 pt-8 text-left font-display text-sm italic text-ivory opacity-0 transition group-hover:opacity-100">
                  {g.caption}
                </span>
              </motion.button>
            </Reveal>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open !== null && items[open] && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-cocoa/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <motion.img
              key={items[open].file}
              src={`${base}gallery/${items[open].file}`}
              alt={items[open].caption}
              className="max-h-[82vh] max-w-full rounded-2xl border-4 border-champagne object-contain shadow-2xl"
              initial={{ scale: 0.92, opacity: 0, rotateY: -12 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-6 left-0 right-0 text-center font-display text-lg italic text-champagne">
              {items[open].caption}
            </p>
            {(['‹', '›'] as const).map((s, k) => (
              <button
                key={s}
                type="button"
                aria-label={k === 0 ? 'Previous photo' : 'Next photo'}
                onClick={(e) => {
                  e.stopPropagation();
                  step(k === 0 ? -1 : 1);
                }}
                className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-3xl text-cocoa ${k === 0 ? 'left-3' : 'right-3'}`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-2xl text-cocoa"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
