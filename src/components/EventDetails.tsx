import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Heart, MapPin } from 'lucide-react';
import { EVENT } from '../config';
import { confetti } from '../lib/confetti';
import { appleMapsUrl, directionsUrl, downloadIcs, googleCalendarUrl, mapEmbedUrl } from '../lib/calendar';
import { scrollToId } from '../lib/scroll';
import { Reveal } from './ui';

const hasAddress: boolean = EVENT.venueAddress.length > 0; // directions + map need a real address
const SEEN_KEY = 'wonder-details-revealed';

// Paint the gold foil: a brushed-metal gradient with speckle and a hint. Afterwards strokes erase it.
function paintFoil(c: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return;
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.globalCompositeOperation = 'source-over';
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#A67A33');
  g.addColorStop(0.3, '#E8CB86');
  g.addColorStop(0.5, '#C99A4A');
  g.addColorStop(0.75, '#F3DC9C');
  g.addColorStop(1, '#B3873A');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 60; i++) {
    x.fillStyle = Math.random() > 0.5 ? 'rgba(255,248,220,.2)' : 'rgba(90,58,20,.16)';
    x.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
  }
  for (let i = 0; i < 22; i++) {
    x.strokeStyle = 'rgba(255,246,214,.13)';
    x.beginPath();
    const y = Math.random() * h;
    x.moveTo(0, y);
    x.lineTo(w, y + (Math.random() - 0.5) * 40);
    x.stroke();
  }
  x.fillStyle = 'rgba(70,44,14,.75)';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = `italic 500 ${Math.min(26, w / 12)}px "Cormorant Garamond", Georgia, serif`;
  x.fillText('✦  scratch here  ✦', w / 2, h / 2);
  x.globalCompositeOperation = 'destination-out';
}

// One scratchable zone: the real text sits underneath (blurred until opened, always readable by screen readers).
function ScratchZone({ open, onOpen, children }: { open: boolean; onOpen: (x: number, y: number) => void; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const s = useRef({ down: false, lx: 0, ly: 0, moves: 0, w: 0, h: 0 });

  useEffect(() => {
    const c = canvas.current;
    const el = wrap.current;
    if (!c || !el) return;
    const run = () => {
      const st = s.current;
      if (st.moves > 0) return; // never wipe progress
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h || (w === st.w && h === st.h)) return;
      st.w = w;
      st.h = h;
      paintFoil(c, w, h);
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cleared = useCallback((): number => {
    const c = canvas.current;
    const x = c?.getContext('2d', { willReadFrequently: true });
    if (!c || !x) return 0;
    const step = Math.max(8, Math.round(8 * Math.min(2, window.devicePixelRatio || 1)));
    let data: Uint8ClampedArray;
    try {
      data = x.getImageData(0, 0, c.width, c.height).data;
    } catch {
      return 0;
    }
    let clear = 0;
    let total = 0;
    for (let y = 0; y < c.height; y += step) {
      for (let xx = 0; xx < c.width; xx += step) {
        total++;
        if (data[(y * c.width + xx) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }, []);

  const finish = useCallback(() => {
    const r = wrap.current?.getBoundingClientRect();
    onOpen(r ? r.left + r.width / 2 : window.innerWidth / 2, r ? r.top + r.height / 2 : window.innerHeight / 2);
  }, [onOpen]);

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const scratch = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const st = s.current;
    const x = e.currentTarget.getContext('2d', { willReadFrequently: true });
    if (!x || open) return;
    const [px, py] = pos(e);
    x.strokeStyle = '#000';
    x.lineWidth = 36;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.beginPath();
    x.moveTo(st.lx, st.ly);
    x.lineTo(px, py);
    x.stroke();
    st.lx = px;
    st.ly = py;
    st.moves++;
    if (st.moves % 6 === 0 && cleared() > 0.5) finish();
  };

  return (
    <div ref={wrap} className="relative min-h-[118px] overflow-hidden rounded-2xl border border-champagne/60 bg-ivory/60 text-left">
      <div className={`flex min-h-[118px] flex-col justify-center px-5 py-4 transition duration-1000 sm:px-7 ${open ? '' : 'opacity-60 blur-[7px]'}`}>{children}</div>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full cursor-grab touch-none transition-opacity duration-700 ${open ? 'pointer-events-none opacity-0' : ''}`}
        onPointerDown={(e) => {
          const st = s.current;
          st.down = true;
          const [px, py] = pos(e);
          st.lx = px;
          st.ly = py;
          e.currentTarget.setPointerCapture(e.pointerId);
          scratch(e);
        }}
        onPointerMove={(e) => {
          if (s.current.down) scratch(e);
        }}
        onPointerUp={() => {
          s.current.down = false;
          if (!open && cleared() > 0.5) finish();
        }}
        onPointerCancel={() => {
          s.current.down = false;
        }}
      />
    </div>
  );
}

const Label = ({ children }: { children: ReactNode }) => <small className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-jade">{children}</small>;

export default function EventDetails() {
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<boolean[]>(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === '1' ? [true, true, true] : [false, false, false];
    } catch {
      return [false, false, false];
    }
  });
  const found = opened.filter(Boolean).length;
  const all = found === 3;

  useEffect(() => {
    if (!all) return;
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* private mode */
    }
  }, [all]);

  useEffect(() => {
    if (!calOpen) return;
    const away = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setCalOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [calOpen]);

  useEffect(() => {
    if (!mapOpen) return;
    const away = (e: MouseEvent) => {
      if (mapRef.current && !mapRef.current.contains(e.target as Node)) setMapOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMapOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [mapOpen]);

  const openZone = useCallback((i: number, x?: number, y?: number, small = false) => {
    setOpened((o) => (o[i] ? o : o.map((v, k) => (k === i ? true : v))));
    confetti({ x, y, count: small ? 24 : 60 });
    try {
      navigator.vibrate?.(25);
    } catch {
      /* not supported */
    }
  }, []);
  const revealAll = () => [0, 1, 2].forEach((i) => window.setTimeout(() => openZone(i, undefined, undefined, true), i * 260));

  return (
    <section id="details" aria-label="Event details" className="relative px-4 py-28 sm:py-36">
      <Reveal className="relative z-10 mx-auto max-w-2xl">
        <div className="glass relative rounded-[36px] px-5 py-12 text-center sm:px-14 sm:py-16">
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-sun" aria-hidden="true" />
          <p className="kicker">The celebration</p>
          <p className="mt-5 font-display text-sm font-medium uppercase tracking-[0.3em] text-ink-soft">
            <span className="text-jade">{EVENT.parents}</span> invite you
          </p>
          <p className="mt-1 font-display text-sm uppercase tracking-[0.35em] text-ink-soft">to celebrate our</p>
          <h2 className="mt-4 font-display text-5xl font-light leading-[1.05] text-ocean sm:text-7xl">
            Baby Shower
            <br />
            <span className="text-coral">&amp;</span> Gender Reveal
          </h2>

          <p className="mx-auto mt-7 flex items-center justify-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.28em] text-jade">
            <span className="h-px w-7 bg-champagne" aria-hidden="true" />
            Scratch the gold to reveal
            <span className="h-px w-7 bg-champagne" aria-hidden="true" />
          </p>

          <div className="mt-4 grid gap-3">
            <ScratchZone open={opened[0]} onOpen={(x, y) => openZone(0, x, y)}>
              <Label>When</Label>
              <p className="mt-1 font-display text-3xl font-normal leading-tight text-ocean sm:text-4xl">{EVENT.dateLabel.replace('November', 'Saturday, November')}</p>
              <p className="font-sans text-base font-medium text-forest">{EVENT.timeLabel}</p>
            </ScratchZone>
            <ScratchZone open={opened[1]} onOpen={(x, y) => openZone(1, x, y)}>
              <Label>Where</Label>
              <p className="mt-1 font-display text-3xl font-semibold uppercase tracking-[0.14em] text-jade sm:text-4xl">{EVENT.venueName}</p>
              <p className="font-sans text-base font-semibold text-ocean">{EVENT.venueRoom}</p>
              <p className="font-sans text-base font-medium text-forest">{EVENT.venueAddress}</p>
            </ScratchZone>
            <ScratchZone open={opened[2]} onOpen={(x, y) => openZone(2, x, y)}>
              <Label>Guest recommended dress colours</Label>
              <p className="mt-1 font-display text-3xl font-normal leading-tight text-ocean sm:text-4xl">{EVENT.dressColours}</p>
              <div className="mt-2 flex" aria-hidden="true">
                {['#6B4A32', '#D9C6A3', '#D8B368'].map((c, i) => (
                  <motion.i
                    key={c}
                    className="-mr-2.5 block h-11 w-11 rounded-full border-[3px] border-ivory shadow-md"
                    style={{ background: c }}
                    initial={false}
                    animate={opened[2] ? { x: 0, scale: 1, opacity: 1 } : { x: -28, scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 160, delay: opened[2] ? i * 0.15 : 0 }}
                  />
                ))}
              </div>
            </ScratchZone>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-xl italic text-jade" aria-live="polite">
              {found} of 3 secrets found
            </p>
            <div className="flex gap-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <i key={i} className={`block h-[3px] w-8 rounded-full transition ${opened[i] ? 'bg-sun shadow-[0_0_10px_#E3BE74]' : 'bg-champagne/40'}`} />
              ))}
            </div>
            {!all && (
              <button type="button" className="btn-ghost !min-h-[44px] !px-5 !py-2 !text-xs" onClick={revealAll}>
                Reveal all
              </button>
            )}
          </div>

          <motion.div
            className="mt-7 grid justify-items-center gap-5"
            initial={false}
            animate={all ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9, delay: all ? 0.4 : 0 }}
            aria-hidden={!all}
            style={{ pointerEvents: all ? 'auto' : 'none', visibility: all ? 'visible' : 'hidden' }}
          >
            <div className="flex items-center gap-4 text-left">
              <MapPin size={36} className="shrink-0 text-jade" aria-hidden="true" />
              <p className="font-display text-2xl leading-tight text-ocean">
                {EVENT.venueName}
                <span className="block font-sans text-base font-semibold">{EVENT.venueRoom}</span>
                <span className="block font-sans text-base font-medium text-forest">{EVENT.venueAddress}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <div className="relative" ref={calRef}>
                <button type="button" className="btn-sun w-full" aria-expanded={calOpen} aria-haspopup="menu" onClick={() => setCalOpen((o) => !o)}>
                  <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
                </button>
                <AnimatePresence>
                  {calOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border-2 border-champagne bg-ivory p-2 text-left shadow-xl"
                    >
                      <a role="menuitem" className="block rounded-xl px-4 py-3 font-display text-lg text-plum hover:bg-sun/30" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setCalOpen(false)}>
                        Google Calendar
                      </a>
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full rounded-xl px-4 py-3 text-left font-display text-lg text-plum hover:bg-sun/30"
                        onClick={() => {
                          downloadIcs();
                          setCalOpen(false);
                        }}
                      >
                        Apple Calendar (.ics)
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full rounded-xl px-4 py-3 text-left font-display text-lg text-plum hover:bg-sun/30"
                        onClick={() => {
                          downloadIcs();
                          setCalOpen(false);
                        }}
                      >
                        Outlook (.ics)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {hasAddress && (
                <div className="relative" ref={mapRef}>
                  <button type="button" className="btn-mint w-full" aria-expanded={mapOpen} aria-haspopup="menu" onClick={() => setMapOpen((o) => !o)}>
                    <MapPin size={18} aria-hidden="true" /> Directions
                  </button>
                  <AnimatePresence>
                    {mapOpen && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-2xl border-2 border-champagne bg-ivory p-2 text-left shadow-xl"
                      >
                        <a role="menuitem" className="block rounded-xl px-4 py-3 font-display text-lg text-plum hover:bg-sun/30" href={directionsUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setMapOpen(false)}>
                          Google Maps
                        </a>
                        <a role="menuitem" className="block rounded-xl px-4 py-3 font-display text-lg text-plum hover:bg-sun/30" href={appleMapsUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setMapOpen(false)}>
                          Apple Maps
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <button type="button" className="btn-ghost" onClick={() => scrollToId('rsvp')}>
                <Heart size={18} aria-hidden="true" /> RSVP
              </button>
            </div>
          </motion.div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="relative z-10 mx-auto mt-12 max-w-3xl">
        {hasAddress && (
          <div className="rounded-[30px] bg-gradient-to-br from-sun via-coral to-turquoise p-[4px] shadow-[0_30px_60px_-28px_rgba(43,26,87,.55)]">
            <div className="overflow-hidden rounded-[26px] bg-ivory">
              <iframe
                title={`Map showing ${EVENT.venueName}`}
                src={mapEmbedUrl()}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="block h-[300px] w-full border-0 [filter:grayscale(1)_contrast(.95)_brightness(.85)] sm:h-[400px]"
              />
            </div>
          </div>
        )}
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-ivory">
          Questions? Call{' '}
          {EVENT.contacts.map((c, i) => (
            <span key={c.tel}>
              {i > 0 && ' or '}
              <a className="underline decoration-sun decoration-2 underline-offset-2" href={`tel:${c.tel}`}>
                {c.name} {c.display}
              </a>
            </span>
          ))}
        </p>
      </Reveal>
    </section>
  );
}
