import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Moon, Shoes, Star, Teddy } from './Illustrations';

const PANELS = [
  {
    kicker: 'Chapter one',
    title: 'Two hearts, one story',
    text: 'Our love grew into something beautiful, and soon our family will too.',
    art: <Moon className="h-28 w-28 drop-shadow-[0_0_28px_rgba(232,211,160,.9)]" />,
  },
  {
    kicker: 'Chapter two',
    title: 'One tiny wonder',
    text: 'Two little feet, one big adventure. We can’t wait to meet you.',
    art: <Shoes className="w-56" />,
  },
  {
    kicker: 'Chapter three',
    title: 'Boy or girl?',
    text: 'Join us as we celebrate, cheer for our teams, and reveal the secret together.',
    art: <Teddy className="w-36" />,
  },
];

// A pinned, scroll-scrubbed three-chapter scene. With reduced motion the
// chapters simply stack as normal content.
export default function Story() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.story-panel', el);
      gsap.set(panels, { autoAlpha: 0, y: 50, scale: 0.96 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0, scale: 1 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: '+=280%', scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      tl.to({}, { duration: 0.5 });
      panels.forEach((p, i) => {
        if (i === 0) return;
        tl.to(panels[i - 1], { autoAlpha: 0, y: -50, scale: 1.05, duration: 0.6 })
          .to(p, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, '<+0.15')
          .to({}, { duration: 0.6 });
      });
      tl.to('.story-glow', { scale: 1.6, opacity: 0.9, duration: tl.duration(), ease: 'none' }, 0);
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-label="Our story"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#EAD9B6_0%,#F6EEDF_30%,#F6EEDF_100%)] motion-safe:h-[100svh]"
    >
      <div className="story-glow absolute left-1/2 top-1/2 h-[80vw] max-h-[620px] w-[80vw] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,211,160,.6)_0%,rgba(232,211,160,0)_65%)] opacity-60" />
      {PANELS.map((p) => (
        <div
          key={p.title}
          className="story-panel flex flex-col items-center justify-center px-8 py-24 text-center motion-safe:absolute motion-safe:inset-0 motion-safe:py-0"
        >
          <div className="mb-8" aria-hidden="true">
            {p.art}
          </div>
          <p className="kicker">{p.kicker}</p>
          <h2 className="mt-4 font-display text-4xl font-medium text-cocoa sm:text-6xl">{p.title}</h2>
          <Star className="my-5 h-4 w-4" />
          <p className="max-w-md font-display text-xl italic leading-relaxed text-mocha sm:text-2xl">{p.text}</p>
        </div>
      ))}
    </section>
  );
}
