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
    window.addEventListener('pointermove', move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', move);
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
      <div ref={glow} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[2] -ml-[190px] -mt-[190px] h-[380px] w-[380px] rounded-full opacity-0 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(243,220,156,.14), transparent 65%)' }} />
    </>
  );
}
