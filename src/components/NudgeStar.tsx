import { motion } from 'framer-motion';

interface Pt {
  x: number;
  y: number;
}

// A shooting star that flies from one point of the screen to another, to point a hesitating guest at what to do next.
export default function NudgeStar({ from, to, duration = 1.6, z = 'z-[105]', onLand }: { from: Pt; to: Pt; duration?: number; z?: string; onLand?: () => void }) {
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 ${z}`}
      initial={{ x: from.x, y: from.y, opacity: 0 }}
      animate={{ x: [from.x, to.x], y: [from.y, to.y], opacity: [0, 1, 1, 0] }}
      transition={{ duration, ease: [0.4, 0, 0.2, 1], opacity: { duration, times: [0, 0.12, 0.86, 1], ease: 'linear' } }}
      onAnimationComplete={onLand}
    >
      <span className="absolute right-0 top-[-1px] block h-[3px] w-[190px] origin-right rounded-full" style={{ transform: `rotate(${angle}deg)`, background: 'linear-gradient(90deg, rgba(255,233,168,0), rgba(255,233,168,.55) 60%, #ffffff)' }} />
      <span className="absolute -left-[5px] -top-[5px] block h-[10px] w-[10px] rounded-full bg-[#FFF8E0]" style={{ boxShadow: '0 0 14px 5px rgba(255,224,140,.9)' }} />
    </motion.div>
  );
}
