import { EVENT } from '../config';
import { directionsUrl, mapEmbedUrl } from '../lib/calendar';
import { Reveal, SectionTitle } from './ui';

export default function MapSection() {
  return (
    <section className="px-5 py-20 sm:py-28" aria-label="Venue map">
      <SectionTitle kicker="Find us" title={EVENT.venueName} sub="Tap the map to explore, or open it in Google Maps for turn-by-turn directions." />
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-4xl">
        <div className="rounded-[28px] bg-gradient-to-br from-champagne via-gold to-champagne p-[2px] shadow-[0_30px_60px_-25px_rgba(110,86,64,.5)]">
          <div className="overflow-hidden rounded-[26px] bg-cream">
            <iframe
              title={`Map showing ${EVENT.venueName}`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[320px] w-full border-0 sm:h-[420px]"
              // warms the stock map colours so it sits in the champagne palette
              style={{ filter: 'sepia(.55) saturate(.85) contrast(.97)' }}
            />
          </div>
        </div>
        <div className="mt-8 text-center">
          <a className="btn-gold" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
      </Reveal>
    </section>
  );
}
