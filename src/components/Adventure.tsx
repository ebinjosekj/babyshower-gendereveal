import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { COUPLE_PHOTO, EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { gsap } from '../lib/gsap';
import { Bird, Butterfly, Cloud, Deer, Elephant, Flower, HotAirBalloon, Island, Rabbit, Rainbow, Star, Tree } from './art';
import { base, Reveal, Words, useImageExists } from './ui';

export default function Adventure() {
  const root = useRef<HTMLElement>(null);
  const { simple } = useMotion();
  const hasCouple = useImageExists(`${base}photos/${COUPLE_PHOTO}`);

  useLayoutEffect(() => {
    const el = root.current;
    if (simple || !el) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.px', el).forEach((n) => {
        const speed = parseFloat(n.dataset.speed ?? '0.2');
        gsap.to(n, {
          yPercent: -speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      gsap.from('.island-rise', {
        y: 90,
        autoAlpha: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.island-rise', start: 'top 85%' },
      });
    }, el);
    return () => ctx.revert();
  }, [simple]);

  return (
    <section
      ref={root}
      id="adventure"
      aria-label="Our little adventure"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFF1C9_0%,#FFE2A8_30%,#D9F5E8_68%,#8EE3C2_100%)] px-5 pb-0 pt-24 sm:pt-32"
    >
      {/* sky decoration */}
      <Rainbow className="pointer-events-none absolute left-1/2 top-4 w-[150%] max-w-[1000px] -translate-x-1/2 opacity-60" />
      <Cloud className="ambient pointer-events-none absolute left-0 top-[8%] w-40 sm:w-72" style={{ animation: 'drift 85s linear infinite' }} />
      <Cloud className="ambient pointer-events-none absolute left-0 top-[34%] w-52 opacity-90 sm:w-96" style={{ animation: 'drift 70s linear -28s infinite' }} />

      <div className="px absolute left-[4%] top-[14%] w-14 sm:left-[10%] sm:w-24" data-speed="0.18" aria-hidden="true">
        <HotAirBalloon className="ambient animate-floaty" />
      </div>
      <div className="px absolute right-[5%] top-[26%] w-12 sm:right-[11%] sm:w-20" data-speed="0.32" aria-hidden="true">
        <HotAirBalloon className="ambient animate-floaty" colors={['#8EE3C2', '#B8A6F0', '#FFC93C', '#FF9A3C', '#27C4C4']} style={{ animationDelay: '1.2s' }} />
      </div>
      <div className="ambient pointer-events-none absolute left-0 top-[44%]" style={{ animation: 'flyAcross 24s linear infinite' }} aria-hidden="true">
        <Butterfly className="w-10" />
      </div>
      <div className="ambient pointer-events-none absolute left-0 top-[62%]" style={{ animation: 'flyBack 30s linear -12s infinite' }} aria-hidden="true">
        <Butterfly className="w-8" a="#27C4C4" b="#FFC93C" />
      </div>
      {[
        ['8%', '40%', 14],
        ['90%', '18%', 18],
        ['76%', '52%', 12],
        ['20%', '66%', 10],
      ].map(([l, t, s], i) => (
        <Star key={i} className="ambient absolute" style={{ left: l as string, top: t as string, width: s as number, animation: `twinkle 3.2s ease-in-out ${i * 0.5}s infinite` }} />
      ))}

      {/* copy */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="kicker">Our little adventure</p>
        </Reveal>
        <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-plum sm:text-6xl">
          <Words text="Two Hearts, One Beautiful Adventure" />
        </h2>
        <Reveal delay={0.2}>
          <p className="title-grad mt-3 font-script text-6xl sm:text-8xl">{EVENT.parents}</p>
          <p className="mx-auto mt-5 max-w-xl text-lg font-semibold leading-relaxed text-ink sm:text-xl">
            Our greatest adventure is about to begin. A tiny little miracle is on its way, bringing with it a lifetime of love, laughter
            and unforgettable memories.
          </p>
        </Reveal>

        {hasCouple && (
          <Reveal delay={0.1} className="mx-auto mt-10 w-[min(78vw,320px)]">
            <motion.div
              className="rounded-[28px] bg-gradient-to-br from-sun via-tangerine to-mint p-[5px] shadow-[0_26px_50px_-22px_rgba(43,26,87,.55)]"
              whileHover={{ rotate: 1.5, scale: 1.02 }}
              initial={{ rotate: -2 }}
            >
              <img src={`${base}photos/${COUPLE_PHOTO}`} alt={`${EVENT.parents}`} loading="lazy" decoding="async" className="w-full rounded-[24px]" />
            </motion.div>
          </Reveal>
        )}
      </div>

      {/* the floating island */}
      <div className="island-rise relative z-10 mx-auto mt-12 w-[min(100%,620px)] pb-6">
        <div className="animate-floaty ambient relative" style={{ animationDuration: '7s' }}>
          <Island className="w-full" />
          <Tree className="absolute bottom-[56%] left-[7%] w-[14%]" />
          <Tree className="absolute bottom-[57%] right-[8%] w-[12%]" c1="#FF9A3C" c2="#FFC93C" />
          <Elephant className="absolute bottom-[55%] left-[27%] w-[24%]" />
          <Rabbit className="absolute bottom-[56%] left-[53%] w-[11%]" />
          <Deer className="absolute bottom-[55%] left-[64%] w-[16%]" />
          <Flower className="absolute bottom-[55%] left-[22%] w-[5%]" color="#FF9A3C" />
          <Flower className="absolute bottom-[54%] left-[48%] w-[5%]" color="#B8A6F0" />
          <Flower className="absolute bottom-[55%] left-[83%] w-[5%]" color="#FFC93C" />
          <Bird className="ambient absolute bottom-[78%] left-[40%] w-[7%] animate-floaty" />
        </div>
      </div>
    </section>
  );
}
