import { useEffect, useRef } from 'react';
import { sfx } from '../lib/sfx';

// A little star with a snake-like tail that weaves from side to side (a zigzag) as the guest scrolls down the page. It drifts
// slowly down the screen across all the sections and only reaches the bottom when the guest reaches the end of the page,
// where it drops into a small burst of light and fades away.
const N = 20; // body segments
const GAP = 10; // px between segments
const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { dx: Math.cos(a) * 38, dy: Math.sin(a) * 38 };
});
// the tail runs from gold to blue/pink, the colours of the two sides
const COLORS = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  const h = i % 2 ? 330 : 210; // pink / blue, alternating down the body
  return `hsl(${i < 3 ? 42 : h} ${i < 3 ? 95 : 85}% ${i < 3 ? 78 : 72 - t * 8}%)`;
});

export default function ScrollStar() {
  const wrap = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = wrap.current;
    const hd = head.current;
    if (!el || !hd) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let hx = W / 2;
    let hy = H * 0.12;
    let op = 0;
    let raf = 0;
    let lastScroll = 0;
    let landed = '';
    let state = 'run';
    let fresh = true;
    const px = new Float32Array(N).fill(hx);
    const py = new Float32Array(N).fill(hy);

    const loop = () => {
      raf = 0;
      // one star for the whole page: its height follows how far down the page the guest is, so it only reaches the bottom of
      // the screen when the guest reaches the end of the page
      const y0 = window.scrollY;
      const total = Math.max(1, document.documentElement.scrollHeight - H);
      const p = Math.min(1, Math.max(0, y0 / total));
      const travelled = y0;
      const appear = Math.min(1, y0 / 180);
      const cur = appear > 0 ? true : null;
      // the zigzag: swings across the screen as the page scrolls past, with a small gentle sway of its own
      const amp = Math.min(W * 0.36, 150);
      const tx = Math.min(W - 18, Math.max(18, W / 2 + amp * Math.sin(travelled / 170) + 6 * Math.sin(performance.now() / 700)));
      const ty = H * (0.12 + 0.74 * p);
      if (fresh && appear < 0.05) {
        // a new section: start the snake coiled at the top
        hx = tx;
        hy = ty;
        px.fill(hx);
        py.fill(hy);
      }
      fresh = appear < 0.05;
      const ddx = tx - hx;
      const ddy = ty - hy;
      hx += ddx * 0.16;
      hy += ddy * 0.16;
      op += ((cur ? appear : 0) - op) * 0.18;
      // body: every segment trails the one in front, keeping a fixed gap, which makes it slither along the zigzag
      let lx = hx;
      let ly = hy;
      for (let i = 0; i < N; i++) {
        let dx = px[i] - lx;
        let dy = py[i] - ly;
        const d = Math.hypot(dx, dy) || 1;
        if (d > GAP) {
          dx = (dx / d) * GAP;
          dy = (dy / d) * GAP;
          px[i] = lx + dx;
          py[i] = ly + dy;
        }
        lx = px[i];
        ly = py[i];
        const dot = dots.current[i];
        if (dot) {
          const s = 1 - (i / N) * 0.75;
          dot.style.transform = `translate3d(${px[i].toFixed(1)}px,${py[i].toFixed(1)}px,0) scale(${s.toFixed(2)})`;
        }
      }
      hd.style.transform = `translate3d(${hx.toFixed(1)}px,${hy.toFixed(1)}px,0)`;
      el.style.opacity = op.toFixed(2);
      // landing: the section's end has reached the bottom of the screen
      if (cur) {
        if (p >= 0.985 && landed !== 'end') {
          landed = 'end';
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
      if (performance.now() - lastScroll < 350 || Math.abs(ddx) + Math.abs(ddy) > 0.6 || Math.abs((cur ? appear : 0) - op) > 0.01) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      lastScroll = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const resize = () => {
      W = window.innerWidth;
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
    <div ref={wrap} className="sstar pointer-events-none fixed left-0 top-0 z-[55] opacity-0" aria-hidden="true">
      {COLORS.map((c, i) => (
        <span key={i} ref={(n) => { dots.current[i] = n; }} className="sstar-dot" style={{ background: c, boxShadow: `0 0 ${8 - i * 0.25}px 1px ${c}`, opacity: 1 - (i / N) * 0.7 }} />
      ))}
      <div ref={head} className="sstar-head">
        <span className="sstar-core" />
        <span className="sstar-ring" />
        {SPARKS.map((s, i) => (
          <span key={i} className="sstar-spark" style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px` }} />
        ))}
      </div>
    </div>
  );
}
