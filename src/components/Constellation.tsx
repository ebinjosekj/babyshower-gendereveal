import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { confetti } from '../lib/confetti';
import { base } from './ui';

export const PHOTOS = [
  { src: `${base}photos/us-1.jpg`, caption: 'Falling for you', x: 24, y: 30 },
  { src: `${base}photos/us-2.jpg`, caption: 'Dressed up and happy', x: 52, y: 66 },
  { src: `${base}photos/us-3.jpg`, caption: 'Rainy-day smiles', x: 79, y: 28 },
];

// Tiny twinkling stars; three brighter "memory stars" open a round photo.
export default function Constellation() {
  const [open, setOpen] = useState<{ i: number; x: number; y: number } | null>(null);
  const tiny = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({ x: (i * 37.7) % 100, y: (i * 53.3 + (i % 5) * 7) % 100, d: (i % 7) * 0.5, s: 1 + (i % 3) })),
    [],
  );

  useEffect(() => {
    PHOTOS.forEach((p) => { const im = new Image(); im.src = p.src; });
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const pick = (i: number, e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    setOpen({ i, x, y });
    confetti({ y, count: 28 });
    try { navigator.vibrate?.(18); } catch { /* ignore */ }
  };

  const p = open ? PHOTOS[open.i] : null;
  return (
    <div className="relative mx-auto mt-12 h-56 w-full max-w-md">
      {tiny.map((t, i) => (
        <span key={i} aria-hidden="true" className="ambient absolute rounded-full bg-ivory" style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.s, height: t.s, opacity: 0.5, animation: `twinkle ${2.4 + t.d}s ease-in-out ${t.d}s infinite` }} />
      ))}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={PHOTOS.map((s) => `${s.x},${s.y}`).join(' ')} fill="none" stroke="rgba(230,190,110,.35)" strokeWidth="0.4" strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {PHOTOS.map((s, i) => (
        <button key={s.src} type="button" aria-label={`Open photo: ${s.caption}`} onClick={(e) => pick(i, e)} className="absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          <span className="ambient absolute h-8 w-8 rounded-full bg-sun/25" style={{ animation: `glowBreath 2.6s ease-in-out ${i * 0.5}s infinite` }} />
          <span className="relative h-3 w-3 rotate-45 bg-sun shadow-[0_0_14px_4px_rgba(230,190,110,.7)]" />
        </button>
      ))}
      <p className="absolute -bottom-7 left-0 right-0 font-sans text-[11px] uppercase tracking-[0.35em] text-ivory/70">Tap a star</p>

      {createPortal(<AnimatePresence>
        {open && p && (
          <motion.div key="ph" className="fixed inset-0 z-[130] grid place-items-center bg-black/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-label={p.caption}>
            <motion.div
              key={open.i}
              className="relative flex flex-col items-center"
              initial={{ scale: 0.05, x: open.x - window.innerWidth / 2, y: open.y - window.innerHeight / 2, opacity: 0 }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.05, opacity: 0, x: open.x - window.innerWidth / 2, y: open.y - window.innerHeight / 2 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              <div className="relative" style={{ width: 'min(72vw,300px)', height: 'min(72vw,300px)' }}>
                <span aria-hidden="true" className="absolute -inset-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(230,190,110,.55), transparent 68%)' }} />
                <span aria-hidden="true" className="ambient absolute -inset-3 rounded-full border border-dashed border-sun/60" style={{ animation: 'spin 24s linear infinite' }} />
                <img src={p.src} alt={p.caption} className="relative h-full w-full rounded-full border-[3px] border-sun object-cover shadow-[0_0_40px_6px_rgba(230,190,110,.45)]" />
              </div>
              <p className="mt-9 font-display text-3xl italic text-ivory">{p.caption}</p>
              <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.35em] text-ivory/60">Tap anywhere to close</p>
            </motion.div>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-ivory"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}
