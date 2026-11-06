import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { EVENT } from '../config';
import { Balloon, Cloud, Moon, Star, Teddy } from './Illustrations';

const Chars = ({ text }: { text: string }) => (
  <>
    {text.split('').map((c, i) => (
      <span key={i} aria-hidden="true" className="hero-char inline-block">
        {c === ' ' ? ' ' : c}
      </span>
    ))}
  </>
);

const STARS = [
  { l: '12%', t: '14%', s: 14, d: 0 },
  { l: '82%', t: '10%', s: 18, d: 0.8 },
  { l: '68%', t: '26%', s: 10, d: 1.4 },
  { l: '24%', t: '30%', s: 9, d: 2 },
  { l: '90%', t: '38%', s: 12, d: 0.4 },
  { l: '8%', t: '48%', s: 11, d: 1.1 },
];

export default function Hero({ active }: { active: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!active || !root.current) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.hero-moon', { autoAlpha: 0, scale: 0.6, duration: 1.8 })
          .from('.hero-kicker', { y: 20, autoAlpha: 0, duration: 1 }, 0.3)
          .from('.hero-char', { yPercent: 110, rotateX: -80, autoAlpha: 0, stagger: 0.05, duration: 1.2 }, 0.5)
          .from('.hero-sub', { y: 24, autoAlpha: 0, duration: 1 }, '-=0.6')
          .from('.hero-date', { y: 24, autoAlpha: 0, duration: 1 }, '-=0.7')
          .from('.hero-teddy', { y: 90, autoAlpha: 0, scale: 0.9, duration: 1.5, ease: 'back.out(1.3)' }, '-=1.1')
          .from('.hero-balloon', { y: 260, autoAlpha: 0, stagger: 0.18, duration: 1.8 }, '-=1.3')
          .from('.scroll-cue', { autoAlpha: 0, duration: 1 }, '-=0.4');

        gsap.to('.hero-float', { y: '-=14', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.5 });

        gsap.utils.toArray<HTMLElement>('.parallax').forEach((el) => {
          const speed = parseFloat(el.dataset.speed ?? '0.2');
          gsap.to(el, {
            yPercent: -speed * 100,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          });
        });
      });
    }, root);
    return () => {
      mm.revert();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [active]);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-16 text-center"
      aria-label="Welcome"
    >
      {/* warm sky */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#FFFDF8_0%,#F8EFDC_45%,#EAD9B6_100%)]" />
      <div className="absolute left-1/2 top-[18%] -z-10 h-[70vw] max-h-[560px] w-[70vw] max-w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,211,160,.55)_0%,rgba(232,211,160,0)_70%)]" />

      {/* moon + stars */}
      <div className="parallax absolute right-[8%] top-[7%] w-20 sm:w-28" data-speed="0.12" aria-hidden="true">
        <Moon className="hero-moon h-full w-full drop-shadow-[0_0_24px_rgba(232,211,160,.9)]" />
      </div>
      {STARS.map((s, i) => (
        <Star
          key={i}
          className="absolute"
          style={{ left: s.l, top: s.t, width: s.s, height: s.s, animation: `twinkle 3.4s ease-in-out ${s.d}s infinite` }}
        />
      ))}

      {/* clouds */}
      <div className="parallax pointer-events-none absolute inset-x-0 top-[16%]" data-speed="0.1" aria-hidden="true">
        <Cloud className="absolute w-44 opacity-80 sm:w-72" style={{ animation: 'drift 90s linear infinite' }} />
      </div>
      <div className="parallax pointer-events-none absolute inset-x-0 top-[40%]" data-speed="0.25" aria-hidden="true">
        <Cloud className="absolute w-56 opacity-90 sm:w-96" style={{ animation: 'drift 70s linear -30s infinite' }} />
      </div>
      <div className="parallax pointer-events-none absolute inset-x-0 bottom-[14%]" data-speed="0.4" aria-hidden="true">
        <Cloud className="absolute w-64 sm:w-[28rem]" style={{ animation: 'drift 55s linear -12s infinite' }} />
      </div>

      {/* balloons */}
      <div className="parallax absolute bottom-[18%] left-[4%] w-12 sm:left-[12%] sm:w-20" data-speed="0.3" aria-hidden="true">
        <div className="hero-float">
          <Balloon className="hero-balloon w-full" />
        </div>
      </div>
      <div className="parallax absolute bottom-[26%] right-[5%] w-10 sm:right-[14%] sm:w-16" data-speed="0.45" aria-hidden="true">
        <div className="hero-float">
          <Balloon pearl className="hero-balloon w-full" />
        </div>
      </div>

      {/* copy */}
      <div className="relative z-10" style={{ perspective: 900 }}>
        <p className="hero-kicker kicker">Baby Shower &amp; Gender Reveal</p>
        <h1 className="gold-text mt-5 font-script text-[19vw] leading-[0.95] sm:text-8xl md:text-9xl" aria-label={EVENT.parents}>
          <span className="block">
            <Chars text={EVENT.parentOne} />
          </span>
          <span className="block">
            <Chars text={`& ${EVENT.parentTwo}`} />
          </span>
        </h1>
        <p className="hero-sub mt-4 font-display text-2xl italic text-mocha sm:text-3xl">{EVENT.tagline}</p>
        <p className="hero-date mt-6 font-sans text-xs uppercase tracking-[0.4em] text-cocoa sm:text-sm">
          November 21, 2026 &nbsp;·&nbsp; 6:00 PM &nbsp;·&nbsp; {EVENT.venueName}
        </p>
      </div>

      {/* teddy */}
      <div className="parallax relative z-10 mt-8 w-36 sm:w-48" data-speed="0.15" aria-hidden="true">
        <div className="hero-float">
          <Teddy className="hero-teddy w-full drop-shadow-[0_18px_22px_rgba(74,54,38,.25)]" />
        </div>
      </div>

      <div className="scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-center" aria-hidden="true">
        <p className="text-[10px] uppercase tracking-[0.5em] text-mocha">Scroll</p>
        <div className="mx-auto mt-2 h-10 w-px bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}
