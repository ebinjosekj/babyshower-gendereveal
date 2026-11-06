import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Heart, MapPin } from 'lucide-react';
import { EVENT } from '../config';
import { directionsUrl, downloadIcs, googleCalendarUrl, mapEmbedUrl } from '../lib/calendar';
import { scrollToId } from '../lib/scroll';
import { Reveal } from './ui';

const hasAddress: boolean = EVENT.venueAddress.length > 0; // directions + map need a real address

export default function EventDetails() {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <section id="details" aria-label="Event details" className="relative px-4 py-28 sm:py-36">
      <Reveal className="relative z-10 mx-auto max-w-2xl">
        <div className="glass relative rounded-[36px] px-6 py-12 text-center sm:px-14 sm:py-16">
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

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-1">
            <p className="font-display text-3xl font-light text-ocean sm:text-4xl">{EVENT.dateLabel}</p>
            <p className="font-display text-2xl font-medium text-coral sm:text-3xl">{EVENT.timeLabel}</p>
            <p className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.3em] text-jade sm:text-4xl">{EVENT.venueName}</p>
            <p className="font-sans text-base font-medium text-forest sm:text-lg">{EVENT.venueAddress}</p>
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
            {hasAddress && (
              <a className="btn-mint" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
                <MapPin size={18} aria-hidden="true" /> Directions
              </a>
            )}
            <button type="button" className="btn-ghost" onClick={() => scrollToId('rsvp')}>
              <Heart size={18} aria-hidden="true" /> RSVP
            </button>
          </div>
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
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-ivory text-sm font-medium">
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
