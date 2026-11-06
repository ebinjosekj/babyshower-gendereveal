import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALLERY } from '../config';
import { Star } from './art';
import { base, Reveal, SectionHead } from './ui';

const FRAMES = [
  'from-sun via-tangerine to-coral',
  'from-mint via-turquoise to-emerald',
  'from-lavender via-[#8E74E0] to-turquoise',
  'from-champagne via-sun to-tangerine',
];

export default function Gallery() {
  const [ok, setOk] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<number | null>(null);

  // Only show photos that actually exist (no broken-image icons).
  useEffect(() => {
    let alive = true;
    GALLERY.forEach((g) => {
      const img = new Image();
      img.onload = () => alive && setOk((s) => new Set(s).add(g.file));
      img.src = `${base}photos/${g.file}`;
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = GALLERY.filter((g) => ok.has(g.file));
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

  const single = items.length === 1;

  return (
    <section
      id="memories"
      aria-label="Our little memories"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#B8A6F0_0%,#FFE2A8_20%,#FFF1C9_100%)] px-4 pb-28 pt-24 sm:pt-32"
    >
      <SectionHead kicker="Our little memories" title="Moments We Treasure" sub="A few favourite memories on the way to meeting you." />

      {items.length === 0 ? (
        <Reveal className="mx-auto mt-12 max-w-md text-center">
          <Star className="mx-auto h-6 w-6" />
          <p className="mt-4 font-display text-2xl italic text-ink">Our favourite photos are coming soon.</p>
        </Reveal>
      ) : (
        <div className="mx-auto mt-14 flex max-w-5xl flex-wrap justify-center gap-6 sm:gap-8">
          {items.map((g, i) => (
            <Reveal
              key={g.file}
              delay={(i % 3) * 0.08}
              className={single ? 'w-full max-w-3xl' : 'w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.4rem)]'}
            >
              <motion.button
                type="button"
                onClick={() => setOpen(i)}
                whileHover={{ y: -8, rotate: i % 2 ? 1.2 : -1.2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open photo: ${g.caption}`}
                className={`group relative block w-full rounded-[28px] bg-gradient-to-br p-[6px] shadow-[0_28px_44px_-24px_rgba(43,26,87,.6)] ${FRAMES[i % FRAMES.length]}`}
                style={{ rotate: single ? 0 : i % 2 ? 1 : -1 }}
              >
                <span className="block rounded-[22px] bg-ivory p-2">
                  <img src={`${base}photos/${g.file}`} alt={g.caption} loading="lazy" decoding="async" className="block w-full rounded-2xl" />
                </span>
                <Star className="absolute -left-2 -top-2 w-6" />
                <Star className="absolute -bottom-2 -right-2 w-6" />
                <span className="pointer-events-none absolute inset-x-[10px] bottom-[10px] rounded-b-2xl bg-gradient-to-t from-plum/70 to-transparent px-4 pb-3 pt-10 text-left font-display text-base text-ivory opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
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
            data-lenis-prevent
            className="fixed inset-0 z-[160] flex items-center justify-center bg-plum/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={items[open].file}
                src={`${base}photos/${items[open].file}`}
                alt={items[open].caption}
                className="max-h-[80vh] max-w-full rounded-3xl border-[6px] border-champagne object-contain shadow-2xl"
                initial={{ opacity: 0, scale: 0.92, rotateY: -14 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
            <p className="absolute bottom-5 left-0 right-0 text-center font-display text-lg italic text-champagne">
              {items[open].caption} · {open + 1}/{items.length}
            </p>
            {items.length > 1 &&
              (['prev', 'next'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-label={k === 'prev' ? 'Previous photo' : 'Next photo'}
                  onClick={(e) => {
                    e.stopPropagation();
                    step(k === 'prev' ? -1 : 1);
                  }}
                  className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-plum ${k === 'prev' ? 'left-3' : 'right-3'}`}
                >
                  {k === 'prev' ? <ChevronLeft /> : <ChevronRight />}
                </button>
              ))}
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-plum">
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
