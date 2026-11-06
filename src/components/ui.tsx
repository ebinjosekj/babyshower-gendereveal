import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMotion } from '../context/MotionContext';
import { Ornament } from './art';

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Word-by-word rising headline.
export function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '115%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function SectionHead({
  kicker,
  title,
  sub,
  dark,
}: {
  kicker: string;
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <p className={`kicker ${dark ? '!text-sun' : ''}`}>{kicker}</p>
      </Reveal>
      <h2 className={`mt-4 font-display text-5xl font-light leading-[1.05] sm:text-7xl ${dark ? 'text-ivory' : 'text-plum'}`}>
        <Words text={title} />
      </h2>
      <Reveal delay={0.2}>
        <Ornament className="mt-5" dark={dark} />
        {sub && (
          <p className={`mx-auto mt-5 max-w-md text-lg font-medium leading-relaxed ${dark ? 'text-ivory/85' : 'text-ink-soft'}`}>
            {sub}
          </p>
        )}
      </Reveal>
    </div>
  );
}

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Twinkling dots for dark / night sections (fewer in simplified mode).
export function StarField({ count = 44 }: { count?: number }) {
  const { simple } = useMotion();
  const n = simple ? Math.round(count / 2.5) : count;
  const stars = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        l: rnd(i + 1) * 100,
        t: rnd(i + 91) * 100,
        s: 2 + rnd(i + 7) * 3.5,
        d: rnd(i + 33) * 4,
      })),
    [n],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="ambient absolute rounded-full bg-[#FFF4B8]"
          style={{
            left: `${s.l}%`,
            top: `${s.t}%`,
            width: s.s,
            height: s.s,
            boxShadow: '0 0 8px 2px rgba(255,236,160,.7)',
            animation: `twinkle 3.4s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Does an optional image (e.g. a couple photo) exist? Avoids broken-image icons.
export function useImageExists(src: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setOk(true);
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return ok;
}

export const base = import.meta.env.BASE_URL;
