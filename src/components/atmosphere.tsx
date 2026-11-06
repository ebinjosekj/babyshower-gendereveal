import { useMemo, type CSSProperties } from 'react';
import { useMotion } from '../context/MotionContext';
import { Cumulus } from './world';

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Sky gradients used by the different parts of the journey.
export const SKY = {
  dawn: 'linear-gradient(180deg,#0B1F29 0%,#14414A 32%,#2C7377 62%,#C98F4A 100%)',
  day: 'linear-gradient(180deg,#0E2530 0%,#18444F 40%,#256A68 78%,#3B7B6C 100%)',
  golden: 'linear-gradient(180deg,#10293A 0%,#1D5560 38%,#7E6A44 82%,#D79A44 100%)',
  dusk: 'linear-gradient(180deg,#0C1F2A 0%,#14333F 40%,#1F4F53 75%,#4F6A52 100%)',
  night: 'linear-gradient(180deg,#08161E 0%,#0F2A35 55%,#183D4B 100%)',
} as const;

// Drifting volumetric clouds; speed differs by depth (far = slow, small, pale).
export function CloudLayer({
  count = 4,
  seed = 1,
  depth = 0.5, // 0 = far, 1 = near
  top = [5, 70],
  className = '',
}: {
  count?: number;
  seed?: number;
  depth?: number;
  top?: [number, number];
  className?: string;
}) {
  const { simple } = useMotion();
  const clouds = useMemo(
    () =>
      Array.from({ length: simple ? Math.max(2, Math.ceil(count / 2)) : count }, (_, i) => ({
        top: top[0] + rnd(seed + i * 3) * (top[1] - top[0]),
        w: 120 + depth * 220 + rnd(seed + i) * 90,
        dur: 140 - depth * 80 + rnd(seed + i + 4) * 40,
        delay: -rnd(seed + i + 8) * 160,
        lift: 6 + rnd(seed + i + 2) * 14,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, seed, depth, simple],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true" style={{ opacity: 0.45 + depth * 0.5 }}>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="ambient absolute left-0"
          style={{ top: `${c.top}%`, width: c.w, animation: `cloudDrift ${c.dur}s linear ${c.delay}s infinite`, willChange: 'transform' }}
        >
          <div className="ambient" style={{ animation: `bob ${8 + c.lift / 2}s ease-in-out infinite` }}>
            <Cumulus className="w-full" warm />
          </div>
        </div>
      ))}
    </div>
  );
}

// Sparse golden motes (no heavy glitter).
export function Motes({ count = 18, seed = 5, className = '' }: { count?: number; seed?: number; className?: string }) {
  const { simple } = useMotion();
  const n = simple ? Math.ceil(count / 3) : count;
  const motes = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        l: rnd(seed + i) * 100,
        t: 20 + rnd(seed + i + 40) * 75,
        s: 2 + rnd(seed + i + 7) * 3,
        d: 6 + rnd(seed + i + 3) * 8,
        delay: -rnd(seed + i + 13) * 12,
      })),
    [n, seed],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {motes.map((m, i) => {
        const st: CSSProperties = {
          left: `${m.l}%`,
          top: `${m.t}%`,
          width: m.s,
          height: m.s,
          background: '#FFE9A8',
          boxShadow: '0 0 10px 3px rgba(240,185,75,.55)',
          animation: `mote ${m.d}s ease-out ${m.delay}s infinite`,
        };
        return <span key={i} className="ambient absolute rounded-full" style={st} />;
      })}
    </div>
  );
}

// A flower-scattered foreground silhouette for the bottom of a section.
export function Meadow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 120" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mdw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C9A78" />
          <stop offset="1" stopColor="#183D4B" />
        </linearGradient>
      </defs>
      <path d="M0 60Q80 20 170 50T340 44T520 54T690 38T800 56V120H0Z" fill="url(#mdw)" />
      {Array.from({ length: 34 }).map((_, i) => {
        const x = (i / 33) * 800;
        const y = 50 + rnd(i + 3) * 26;
        const c = ['#E98C56', '#F1E8D6', '#8974BD', '#F0B94B'][i % 4];
        return (
          <g key={i}>
            <path d={`M${x} ${y + 14}V${y}`} stroke="#2C6B66" strokeWidth="1.5" />
            <circle cx={x} cy={y} r={3 + rnd(i) * 2.5} fill={c} />
          </g>
        );
      })}
    </svg>
  );
}
