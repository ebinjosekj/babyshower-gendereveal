import { COUPLE_PHOTO, EVENT } from '../config';
import { Meadow, Motes, CloudLayer, SKY } from './atmosphere';
import { Reveal, base, useImageExists } from './ui';
import { Butterfly, GardenIsland } from './world';

function ArchFrame({ file, className, alt }: { file: string; className: string; alt: string }) {
  const ok = useImageExists(`${base}photos/${file}`);
  if (!ok) return null;
  return (
    <figure className={`relative ${className}`}>
      <div className="rounded-t-[999px] rounded-b-3xl bg-gradient-to-b from-sun via-champagne to-sun p-[5px] shadow-[0_30px_50px_-24px_rgba(10,35,45,.7)]">
        <img src={`${base}photos/${file}`} alt={alt} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-t-[999px] rounded-b-[20px] object-cover" />
      </div>
    </figure>
  );
}

// "Two hearts. One beautiful journey." — uses the couple's real photos only.
export default function Story() {
  const hasMain = useImageExists(`${base}photos/${COUPLE_PHOTO}`);
  const has1 = useImageExists(`${base}photos/01.jpg`);
  const has2 = useImageExists(`${base}photos/02.jpg`);
  const anyPhoto = hasMain || has1 || has2;

  return (
    <section id="story" aria-label="Our little story" className="relative overflow-hidden px-5 pb-32 pt-24 sm:pt-32" style={{ background: SKY.day }}>
      <CloudLayer count={4} seed={21} depth={0.4} top={[2, 40]} />
      <Motes count={12} seed={31} />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <Reveal>
            <p className="kicker !text-ivory">Our little story</p>
            <h2 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.08] text-ivory [text-shadow:0_3px_22px_rgba(10,35,45,.55)] sm:text-6xl">
              Two hearts.
              <br />
              <span className="text-sun">One beautiful journey.</span>
            </h2>
          </Reveal>
        </div>

        <div className={`mt-14 grid items-center gap-10 ${anyPhoto ? 'md:grid-cols-2' : ''}`}>
          {anyPhoto ? (
            <Reveal className="relative mx-auto grid w-full max-w-md grid-cols-6 items-end gap-3">
              {hasMain ? (
                <ArchFrame file={COUPLE_PHOTO} alt={`${EVENT.parents}`} className="col-span-4 col-start-2 z-10" />
              ) : (
                <ArchFrame file="01.jpg" alt="Nikhitha and Ebin" className="col-span-4 col-start-2 z-10" />
              )}
              {hasMain && has1 && <ArchFrame file="01.jpg" alt="Nikhitha and Ebin together" className="col-span-3 -mt-24 translate-y-8" />}
              {hasMain && has2 && <ArchFrame file="02.jpg" alt="A moment together" className="col-span-3 col-start-4 -mt-24 translate-y-14" />}
            </Reveal>
          ) : null}

          <Reveal delay={0.1} className="mx-auto max-w-md text-center md:text-left">
            <div className="glass rounded-[28px] p-7 sm:p-9">
              <p className="font-display text-2xl italic leading-snug text-ocean sm:text-3xl">
                Every beautiful journey has a beginning.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-forest">
                Ours is about to become even more special as we prepare to welcome a little miracle into our lives.
              </p>
              <p className="mt-5 font-display text-xl font-semibold tracking-wide text-jade">— {EVENT.parents}</p>
            </div>
          </Reveal>
        </div>

        {!anyPhoto && (
          <Reveal delay={0.2} className="relative mx-auto mt-14 w-[min(86vw,420px)]">
            <GardenIsland className="w-full drop-shadow-[0_26px_30px_rgba(10,35,45,.45)]" />
            <Butterfly className="ambient absolute -top-2 right-6 w-9" style={{ animation: 'bob 6s ease-in-out infinite' }} />
          </Reveal>
        )}
      </div>
      <Meadow className="pointer-events-none absolute inset-x-0 bottom-0 h-[9%] w-full" />
    </section>
  );
}
