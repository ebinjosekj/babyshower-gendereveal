import { useEffect, useRef } from 'react';
import { sfx } from '../lib/sfx';

// A little gold star that travels down the right edge as the guest scrolls through each section: it waits at the top of a
// section, follows the scroll (with a soft lag and a tail that stretches with speed) and, as the section ends, drops into a
// small burst of light at the bottom and fades away. The next section sends a new star.
const IDS = ['story', 'countdown', 'reveal', 'details', 'rsvp', 'finale'];
const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { dx: Math.cos(a) * 34, dy: Math.sin(a) * 34 };
});

export default function ScrollStar() {
  const wrap = useRef<HTMLDivElement>(null);
  const tail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const tl = tail.current;
    if (!el || !tl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let H = window.innerHeight;
    let y = H * 0.12;
    let op = 0;
    let raf = 0;
    let lastScroll = 0;
    let landed = '';
    let state = 'run';

    const loop = () => {
      raf = 0;
      let cur: HTMLElement | null = null;
      let p = 0;
      let appear = 0;
      for (const id of IDS) {
        const s = document.getElementById(id);
        if (!s) continue;
        const r = s.getBoundingClientRect();
        const range = r.height - H;
        if (range < 120) continue;
        if (r.top <= H * 0.6 && r.bottom > H * 0.4) {
          cur = s;
          p = Math.min(1, Math.max(0, -r.top / range));
          appear = Math.min(1, Math.max(0, (H * 0.6 - r.top) / (H * 0.35)));
          break;
        }
      }
      const target = H * (0.12 + 0.74 * p);
      const delta = target - y;
      y += delta * 0.14;
      const want = cur ? appear : 0;
      op += (want - op) * 0.18;
      // landing: the section's end has reached the bottom of the screen
      if (cur) {
        if (p >= 0.985 && landed !== cur.id) {
          landed = cur.id;
          state = 'land';
          el.dataset.s = 'land';
          sfx.play('diamond');
        } else if (p < 0.94 && state === 'land') {
          state = 'run';
          landed = '';
          delete el.dataset.s;
        }
      } else if (state === 'land' && performance.now() - lastScroll > 1200) {
        state = 'run';
        delete el.dataset.s;
      }
      el.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      el.style.opacity = op.toFixed(2);
      tl.style.transform = `scaleY(${(0.35 + Math.min(1.6, Math.abs(delta) / 40)).toFixed(2)})`;
      if (performance.now() - lastScroll < 250 || Math.abs(delta) > 0.4 || Math.abs(want - op) > 0.01) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      lastScroll = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      H = window.innerHeight;
      kick();
    };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', resize);
    kick();
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} className="sstar pointer-events-none fixed right-[14px] top-0 z-[55] opacity-0" aria-hidden="true">
      <span ref={tail} className="sstar-tail" />
      <span className="sstar-core" />
      <span className="sstar-ring" />
      {SPARKS.map((s, i) => (
        <span key={i} className="sstar-spark" style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px` }} />
      ))}
    </div>
  );
}
