import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const MOTES = Array.from({ length: 26 }, (_, i) => ({
  left: rnd(i) * 100,
  size: 2 + rnd(i + 40) * 3,
  dur: 14 + rnd(i + 80) * 18,
  delay: -rnd(i + 120) * 30,
  sway: (rnd(i + 160) - 0.5) * 120,
  alpha: 0.35 + rnd(i + 200) * 0.45,
}));

const BITS = Array.from({ length: 16 }, (_, i) => ({
  left: rnd(i + 300) * 100,
  w: 5 + rnd(i + 340) * 5,
  h: 8 + rnd(i + 380) * 8,
  dur: 16 + rnd(i + 420) * 16,
  delay: -rnd(i + 460) * 32,
  sway: (rnd(i + 500) - 0.5) * 160,
  color: ['#F2A6C0', '#7FB6E6', '#E3BE74', '#F6ECD0'][i % 4],
}));

const SHOOTERS = [
  { top: 6, left: 70, delay: 2, dur: 9 },
  { top: 22, left: 92, delay: 6, dur: 11 },
  { top: 12, left: 48, delay: 10, dur: 13 },
];
const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: 4 + rnd(i + 600) * 92,
  top: 6 + rnd(i + 640) * 88,
  size: 10 + rnd(i + 680) * 16,
  dur: 4 + rnd(i + 720) * 5,
  delay: -rnd(i + 760) * 8,
}));

// Gold progress line, drifting gold dust and a soft light that follows the cursor.
export default function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const el = glow.current;
    if (!el) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = '1';
    };
    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      el.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    // a gold ring ripples out wherever the page is tapped or clicked
    const ripple = (e: PointerEvent) => {
      const r = document.createElement('span');
      r.className = 'click-ripple';
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      r.addEventListener('animationend', () => r.remove());
      document.body.appendChild(r);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', ripple);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', ripple);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <motion.div aria-hidden="true" className="fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-champagne via-sun to-[#FFE9A8] shadow-[0_0_12px_rgba(227,190,116,.7)]" style={{ scaleX: x }} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="ambient absolute bottom-0 rounded-full bg-[#F3DC9C]"
            style={{
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              opacity: m.alpha,
              boxShadow: '0 0 8px 2px rgba(227,190,116,.55)',
              ['--sway' as string]: `${m.sway}px`,
              animation: `riseUp ${m.dur}s linear ${m.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {BITS.map((b, i) => (
          <span
            key={i}
            className="ambient absolute top-0 rounded-[2px]"
            style={{ left: `${b.left}%`, width: b.w, height: b.h, background: b.color, opacity: 0.5, ['--sway' as string]: `${b.sway}px`, animation: `fall ${b.dur}s linear ${b.delay}s infinite` }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {SHOOTERS.map((m, i) => (
          <span key={i} className="ambient absolute block h-[2px] w-[130px] rounded-full opacity-0" style={{ top: `${m.top}%`, left: `${m.left}%`, background: 'linear-gradient(90deg,#FFF6D6,rgba(255,246,214,0))', boxShadow: '0 0 10px 2px rgba(255,236,160,.5)', animation: `shoot ${m.dur}s linear ${m.delay}s infinite` }} />
        ))}
        {SPARKLES.map((m, i) => (
          <svg key={i} viewBox="0 0 24 24" className="ambient absolute opacity-0" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animation: `twirl ${m.dur}s ease-in-out ${m.delay}s infinite` }}>
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#F3DC9C" />
          </svg>
        ))}
      </div>
      <div ref={glow} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[2] -ml-[190px] -mt-[190px] h-[380px] w-[380px] rounded-full opacity-0 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(243,220,156,.14), transparent 65%)' }} />
    </>
  );
}
