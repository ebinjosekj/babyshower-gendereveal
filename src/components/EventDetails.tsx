import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Heart, MapPin } from 'lucide-react';
import { EVENT } from '../config';
import { directionsUrl, downloadIcs, googleCalendarUrl, mapEmbedUrl } from '../lib/calendar';
import { scrollToId } from '../lib/scroll';
import { CloudLayer, Meadow, Motes, SKY } from './atmosphere';
import { Balloon, Spark } from './world';
import { Reveal } from './ui';

const hasAddress: boolean = EVENT.venueAddress.length > 0; // directions + map need a real address

export default function EventDetails() {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <section id="details" aria-label="Event details" className="relative overflow-hidden px-4 pb-32 pt-24 sm:pt-32" style={{ background: SKY.day }}>
      <CloudLayer count={4} seed={141} depth={0.35} top={[0, 40]} />
      <Motes count={14} seed={27} />
      <Balloon className="ambient absolute left-[3%] top-[10%] w-14 sm:left-[8%] sm:w-24" colors={['#E98C56', '#F1E8D6']} style={{ animation: 'bob 11s ease-in-out infinite' }} />
      <Balloon className="ambient absolute right-[3%] top-[16%] w-12 sm:right-[8%] sm:w-20" colors={['#8974BD', '#F0B94B']} style={{ animation: 'bob 13s ease-in-out -4s infinite' }} />

      <Reveal className="relative z-10 mx-auto max-w-2xl">
        <div className="glass relative rounded-[36px] px-6 py-12 text-center sm:px-14 sm:py-16">
          <Spark className="absolute -top-3 left-1/2 w-7 -translate-x-1/2" />
          <p className="kicker">The celebration</p>
          <p className="mt-5 font-display text-sm font-medium uppercase tracking-[0.3em] text-ink-soft">
            <span className="text-jade">{EVENT.parents}</span> invite you
          </p>
          <p className="mt-1 font-display text-sm uppercase tracking-[0.35em] text-ink-soft">to celebrate our</p>
          <h2 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.1] text-plum sm:text-6xl">
            Baby Shower
            <br />
            <span className="text-coral">&amp;</span> Gender Reveal
          </h2>

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-1">
            <p className="font-display text-3xl font-semibold text-plum sm:text-4xl">{EVENT.dateLabel}</p>
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
              className="block h-[300px] w-full border-0 sm:h-[400px]"
            />
          </div>
        </div>
        )}
        <p className="mt-4 rounded-2xl bg-ocean/55 px-4 py-3 text-ivory backdrop-blur text-center text-sm font-medium">
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

      <Meadow className="pointer-events-none absolute inset-x-0 bottom-0 h-[8%] w-full" />
    </section>
  );
}
