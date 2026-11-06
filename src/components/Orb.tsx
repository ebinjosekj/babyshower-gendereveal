import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useMotion } from '../context/MotionContext';

type Tone = 'gold' | 'emerald';

const TONES: Record<Tone, { body: string; glow: string; rim: string }> = {
  gold: {
    body: 'radial-gradient(circle at 34% 28%, #FFF4D2 0%, #F0CF8C 22%, #C99A52 50%, #6E4A1E 78%, #1E1408 100%)',
    glow: 'rgba(227,190,116,.38)',
    rim: 'inset -26px -34px 70px rgba(0,0,0,.6), inset 12px 14px 44px rgba(255,244,210,.35), 0 0 90px rgba(227,190,116,.35)',
  },
  emerald: {
    body: 'radial-gradient(circle at 34% 28%, #D9F2E0 0%, #6FBF9B 22%, #2E8266 50%, #124434 78%, #07140F 100%)',
    glow: 'rgba(60,170,130,.34)',
    rim: 'inset -26px -34px 70px rgba(0,0,0,.65), inset 12px 14px 44px rgba(217,242,224,.3), 0 0 90px rgba(60,170,130,.3)',
  },
};

// One glowing sphere: lit body, soft atmosphere, slow surface light, thin orbit rings.
export function OrbBody({ tone = 'gold', rings = true, className = '' }: { tone?: Tone; rings?: boolean; className?: string }) {
  const t = TONES[tone];
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      <div className="absolute inset-[-35%] rounded-full" style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 62%)` }} />
      <div className="ambient absolute inset-0 rounded-full" style={{ background: t.body, boxShadow: t.rim, animation: 'orbBreath 7s ease-in-out infinite' }}>
        <div className="spin ambient absolute inset-0 rounded-full opacity-40 mix-blend-soft-light" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,.7) 14%, transparent 32%, rgba(255,255,255,.4) 58%, transparent 80%)', animationDuration: '40s' }} />
        <div className="absolute left-[18%] top-[12%] h-[22%] w-[30%] -rotate-[28deg] rounded-full bg-white/30 blur-xl" />
      </div>
      {rings && (
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-[-28%] h-[156%] w-[156%] overflow-visible" fill="none">
          <g className="spin ambient" style={{ transformOrigin: '50px 50px', animationDuration: '90s' }}>
            <ellipse cx="50" cy="50" rx="48" ry="16" stroke="#E3BE74" strokeOpacity=".45" strokeWidth=".25" transform="rotate(-18 50 50)" />
            <circle cx="98" cy="50" r=".9" fill="#FFE9A8" transform="rotate(-18 50 50)" />
          </g>
          <g className="spin-rev ambient" style={{ transformOrigin: '50px 50px', animationDuration: '120s' }}>
            <ellipse cx="50" cy="50" rx="44" ry="26" stroke="#E3BE74" strokeOpacity=".28" strokeWidth=".25" transform="rotate(32 50 50)" />
          </g>
          <circle cx="50" cy="50" r="40" stroke="#E3BE74" strokeOpacity=".16" strokeWidth=".2" />
        </svg>
      )}
    </div>
  );
}

// The page-long orb: fixed behind the content; scroll brightens, shrinks, shifts to emerald, then dims to a point.
export function ScrollOrb() {
  const { simple } = useMotion();
  const { scrollYProgress: p } = useScroll();
  const scale = useTransform(p, [0, 0.1, 0.3, 0.55, 0.88, 1], [1, 1.12, 0.78, 0.55, 0.5, 0.08]);
  const y = useTransform(p, [0, 0.3, 1], ['0vh', '-6vh', '10vh']);
  const opacity = useTransform(p, [0, 0.1, 0.3, 0.55, 0.9, 1], [1, 1, 0.5, 0.26, 0.26, 1]);
  const emerald = useTransform(p, [0.1, 0.32, 0.88, 0.97], [0, 1, 1, 0]);
  const gold: MotionValue<number> = useTransform(emerald, (v) => 1 - v);
  const rotate = useTransform(p, [0, 1], [0, 80]);

  const still = simple ? { scale: 1, opacity: 0.55 } : undefined;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-start justify-center overflow-hidden" aria-hidden="true">
      <motion.div style={still ?? { scale, y, opacity, rotate }} className="mt-[9svh] w-[min(72vw,440px)]">
        <div className="relative">
          <motion.div style={{ opacity: simple ? 1 : gold }}>
            <OrbBody tone="gold" />
          </motion.div>
          {!simple && (
            <motion.div style={{ opacity: emerald }} className="absolute inset-0">
              <OrbBody tone="emerald" rings={false} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
