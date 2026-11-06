import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Heart, MapPin } from 'lucide-react';
import { EVENT } from '../config';
import { directionsUrl, downloadIcs, googleCalendarUrl, mapEmbedUrl } from '../lib/calendar';
import { scrollToId } from '../lib/scroll';
import { Flower, PartyBalloon, Star } from './art';
import { Reveal } from './ui';

const BULBS = ['#FFC93C', '#FF7A66', '#8EE3C2', '#B8A6F0', '#FF9A3C', '#27C4C4'];
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  l: (i * 6.3 + 3) % 100,
  c: BULBS[i % BULBS.length],
  d: (i * 1.3) % 9,
  t: 9 + (i % 5) * 2,
  s: (i % 2 ? 1 : -1) * (20 + (i % 4) * 12),
}));

export default function EventDetails() {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <section
      id="details"
      aria-label="Event details"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#D9F5E8_0%,#FFF1C9_30%,#FFE2A8_100%)] px-4 pb-28 pt-24 sm:pt-32"
    >
      {/* string lights */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full sm:h-20" aria-hidden="true">
        <path d="M0 8Q50 50 100 8T200 8T300 8T400 8" stroke="#8A6D9E" strokeWidth="1.2" fill="none" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={25 + i * 50} cy={i % 2 ? 22 : 30} r="5" fill={BULBS[i % BULBS.length]} className="ambient" style={{ animation: `twinkle 2.2s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
      </svg>

      {/* falling confetti */}
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="ambient hide-simple pointer-events-none absolute top-0 h-3 w-2 rounded-[2px]"
          style={{ left: `${c.l}%`, background: c.c, ['--sway' as string]: `${c.s}px`, animation: `fall ${c.t}s linear ${c.d}s infinite` }}
        />
      ))}

      {/* balloons */}
      <div className="absolute left-[2%] top-[14%] flex w-24 items-end gap-0 sm:left-[7%] sm:w-40" aria-hidden="true">
        <PartyBalloon className="ambient animate-floaty w-1/2" color="#FFC93C" />
        <PartyBalloon className="ambient animate-floaty -ml-2 w-1/2" color="#8EE3C2" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute right-[2%] top-[18%] flex w-24 items-end sm:right-[7%] sm:w-40" aria-hidden="true">
        <PartyBalloon className="ambient animate-floaty w-1/2" color="#B8A6F0" style={{ animationDelay: '.6s' }} />
        <PartyBalloon className="ambient animate-floaty -ml-2 w-1/2" color="#FF9A3C" style={{ animationDelay: '1.6s' }} />
      </div>

      <Reveal className="relative z-10 mx-auto max-w-2xl">
        <div className="glass relative rounded-[36px] px-6 py-12 text-center sm:px-14 sm:py-16">
          <Star className="absolute -top-3 left-1/2 w-7 -translate-x-1/2" />
          <p className="kicker">The celebration</p>
          <p className="mt-5 font-display text-sm font-bold uppercase tracking-[0.3em] text-ink-soft">
            <span className="title-grad">{EVENT.parents}</span> invite you
          </p>
          <p className="mt-1 font-display text-sm uppercase tracking-[0.35em] text-ink-soft">to celebrate our</p>
          <h2 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.1] text-plum sm:text-6xl">
            Baby Shower
            <br />
            <span className="text-tangerine">&amp;</span> Gender Reveal
          </h2>

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-1">
            <p className="font-display text-3xl font-semibold text-plum sm:text-4xl">{EVENT.dateLabel}</p>
            <p className="font-display text-2xl font-medium text-tangerine sm:text-3xl">{EVENT.timeLabel}</p>
            <p className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.3em] text-emerald sm:text-4xl">{EVENT.venueName}</p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <div className="relative">
              <button type="button" className="btn-sun w-full" aria-expanded={calOpen} onClick={() => setCalOpen((o) => !o)}>
                <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
              </button>
              {calOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border-2 border-champagne bg-ivory p-2 shadow-xl"
                >
                  <a className="block rounded-xl px-4 py-3 font-display text-plum hover:bg-sun/30" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setCalOpen(false)}>
                    Google Calendar
                  </a>
                  <button type="button" className="block w-full rounded-xl px-4 py-3 text-left font-display text-plum hover:bg-sun/30" onClick={() => { downloadIcs(); setCalOpen(false); }}>
                    Apple / Outlook (.ics)
                  </button>
                </motion.div>
              )}
            </div>
            <a className="btn-mint" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
              <MapPin size={18} aria-hidden="true" /> Directions
            </a>
            <button type="button" className="btn-ghost" onClick={() => scrollToId('rsvp')}>
              <Heart size={18} aria-hidden="true" /> RSVP
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="relative z-10 mx-auto mt-12 max-w-3xl">
        <div className="rounded-[30px] bg-gradient-to-br from-sun via-tangerine to-mint p-[4px] shadow-[0_30px_60px_-28px_rgba(43,26,87,.55)]">
          <div className="overflow-hidden rounded-[26px] bg-ivory">
            <iframe
              title={`Map showing ${EVENT.venueName}`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[300px] w-full border-0 sm:h-[400px]"
            />
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-ink-soft">
          Questions? Call{' '}
          {EVENT.contacts.map((c, i) => (
            <span key={c.tel}>
              {i > 0 && ' or '}
              <a className="underline decoration-tangerine decoration-2 underline-offset-2" href={`tel:${c.tel}`}>
                {c.name} {c.display}
              </a>
            </span>
          ))}
        </p>
      </Reveal>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-around px-2" aria-hidden="true">
        {['#FFC93C', '#FF7A66', '#B8A6F0', '#FF9A3C', '#8EE3C2', '#FFC93C', '#27C4C4'].map((c, i) => (
          <Flower key={i} className="w-10 sm:w-14" color={c} />
        ))}
      </div>
    </section>
  );
}
