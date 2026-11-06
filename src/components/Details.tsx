import type { ReactNode } from 'react';
import { EVENT } from '../config';
import { directionsUrl, downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { Reveal, SectionTitle, Tilt } from './ui';

const Row = ({ icon, label, children }: { icon: string; label: string; children: ReactNode }) => (
  <div className="flex gap-4">
    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-champagne/30 font-display text-xl text-gold-deep">
      {icon}
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-[0.35em] text-gold-deep">{label}</p>
      <div className="mt-1 font-display text-2xl leading-snug text-cocoa">{children}</div>
    </div>
  </div>
);

export default function Details() {
  return (
    <section className="px-5 py-20 sm:py-28" aria-label="Event details">
      <SectionTitle kicker="Save the date" title={<>Come celebrate<br />with us</>} />
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
        <Tilt className="glass relative overflow-hidden rounded-[28px] p-7 sm:p-12" max={4}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,211,160,.6),transparent_70%)]" />
          <div className="relative grid gap-8">
            <Row icon="✦" label="Event">
              {EVENT.title}
              <span className="block text-lg italic text-mocha">hosted by {EVENT.parents}</span>
            </Row>
            <Row icon="◷" label="When">
              {EVENT.dateLabel}
              <span className="block text-lg italic text-mocha">{EVENT.timeLabel}</span>
            </Row>
            <Row icon="⌖" label="Where">
              {EVENT.venueName}
              {EVENT.venueAddressLine && <span className="block text-lg italic text-mocha">{EVENT.venueAddressLine}</span>}
            </Row>
            <Row icon="❦" label="Dress code">
              <span className="text-xl">{EVENT.dressCode}</span>
              <span className="mt-2 flex gap-2" aria-hidden="true">
                {['#6E5640', '#D9C6A3', '#C9A24E'].map((c) => (
                  <i key={c} className="h-5 w-5 rounded-full border border-white/70 shadow" style={{ background: c }} />
                ))}
              </span>
            </Row>
          </div>
          <div className="relative mt-10 flex flex-col gap-3 sm:flex-row">
            <a className="btn-gold flex-1" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
              Add to Google Calendar
            </a>
            <button type="button" className="btn-ghost flex-1" onClick={downloadIcs}>
              Apple / Outlook (.ics)
            </button>
            <a className="btn-ghost flex-1" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
              Get directions
            </a>
          </div>
        </Tilt>
      </Reveal>
    </section>
  );
}
