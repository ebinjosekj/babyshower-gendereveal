import { sfx } from '../lib/sfx';
import { useCallback, useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { base } from './ui';

// A sideways carousel: the three photos orbit round, one coming to the front at a time, forever.
const SPARKS = [[-124, -56], [120, -64], [-104, 62], [108, 66], [0, -98], [-30, 92]];
const R = 100;
const STEP = 90; // 4 photos, a quarter turn each
const rad = (d: number) => (d * Math.PI) / 180;

function OrbitPhoto({ n, offset, angle }: { n: number; offset: number; angle: MotionValue<number> }) {
  const th = useTransform(angle, (a) => rad(offset - a));
  const x = useTransform(th, (t) => Math.sin(t) * R);
  const front = useTransform(th, (t) => (Math.cos(t) + 1) / 2); // 1 = in front, 0 = behind
  const scale = useTransform(front, (f) => 0.58 + 0.5 * f);
  const opacity = useTransform(front, (f) => 0.5 + 0.5 * f);
  const rotateY = useTransform(th, (t) => -Math.sin(t) * 38);
  const zIndex = useTransform(front, (f) => Math.round(f * 10));
  return (
    <motion.img
      src={`${base}photos/us-${n}.jpg`}
      alt=""
      className="absolute h-[132px] w-[132px] rounded-full border-[3px] border-sun object-cover shadow-[0_14px_30px_-10px_rgba(26,36,31,.65)]"
      style={{ x, scale, opacity, rotateY, zIndex }}
    />
  );
}

export default function PhotoOrbit() {
  const angle = useMotionValue(0);
  const timer = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const next = useCallback(() => {
    const r = wrap.current?.getBoundingClientRect();
    if (r && r.bottom > 0 && r.top < window.innerHeight) sfx.play('swish');
    animate(angle, Math.round(angle.get() / STEP) * STEP + STEP, { duration: 1.7, ease: [0.45, 0, 0.2, 1] });
  }, [angle]);
  const start = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(next, 3800);
  }, [next]);
  useEffect(() => {
    start();
    return () => window.clearInterval(timer.current);
  }, [start]);
  // Tap a photo to bring the next one round straight away.
  const tap = () => {
    next();
    start();
    try { navigator.vibrate?.(12); } catch { /* ignore */ }
  };
  return (
    <motion.div ref={wrap} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }} className="relative mx-auto flex h-48 cursor-pointer items-center justify-center" style={{ perspective: 700 }} onClick={tap}>
      {[0, 1.2, 2.4].map((d) => (
        <span key={d} className="orbit-ripple ambient absolute h-44 w-44 rounded-full border border-sun/50" style={{ animationDelay: `${d}s` }} />
      ))}
      <span className="thank-halo absolute h-44 w-44 rounded-full bg-sun/25" />
      <span className="ambient absolute h-56 w-56 rounded-full border border-dashed border-sun/60" style={{ animation: 'spin 28s linear infinite' }} />
      {SPARKS.map(([x, y], i) => (
        <span key={i} className="absolute" style={{ marginLeft: x, marginTop: y }}>
          <span className="thank-spark block h-2 w-2 bg-sun" style={{ animationDelay: `${0.6 + i * 0.35}s` }} />
        </span>
      ))}
      {[1, 2, 3, 4].map((n) => (
        <OrbitPhoto key={n} n={n} offset={(n - 1) * STEP} angle={angle} />
      ))}
    </motion.div>
  );
}

