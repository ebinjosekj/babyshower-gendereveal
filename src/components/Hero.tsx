import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { scrollToId } from '../lib/scroll';
import { CloudLayer, Meadow, Motes, SKY } from './atmosphere';
import { Balloon, Butterfly, CastleIsland, HeroIsland, Mist, RainbowArch } from './world';

// Layered world: far (soft, pale) → mid (island, rainbow) → near (flowers, butterflies).
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { simple } = useMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const far = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const near = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const px = (v: typeof far) => (simple ? undefined : { y: v });

  return (
    <section ref={ref} id="top" aria-label="Welcome" className="relative min-h-[100svh] overflow-hidden" style={{ background: SKY.golden }}>
      {/* sun glow */}
      <div className="absolute right-[-10%] top-[34%] h-[60%] w-[80%]" style={{ background: 'radial-gradient(circle,rgba(255,226,150,.85),rgba(255,226,150,0) 60%)' }} aria-hidden="true" />

      {/* background */}
      <motion.div style={px(far)} className="absolute inset-0" aria-hidden="true">
        <CloudLayer count={4} seed={4} depth={0.15} top={[6, 45]} />
        <div className="absolute right-[2%] top-[38%] w-[34%] max-w-[240px] opacity-70 [filter:saturate(.7)_brightness(1.12)]">
          <CastleIsland className="w-full" />
        </div>
        <div className="absolute left-[4%] top-[48%] w-[22%] max-w-[150px] opacity-60 [filter:saturate(.6)_brightness(1.15)]">
          <HeroIsland className="w-full" />
        </div>
        <Balloon className="ambient absolute left-[58%] top-[44%] w-5" colors={['#347D76', '#F1E8D6']} style={{ animation: 'bob 14s ease-in-out infinite' }} />
        <Balloon className="ambient absolute left-[16%] top-[40%] w-4" colors={['#E98C56', '#F1E8D6']} style={{ animation: 'bob 17s ease-in-out infinite' }} />
      </motion.div>

      {/* midground */}
      <motion.div style={px(mid)} className="absolute inset-x-0 bottom-[6%]" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-[24%] mx-auto w-[150vw] max-w-[1000px] -translate-x-0 opacity-90 sm:w-[120vw]" style={{ left: 0, right: 0 }}>
          <RainbowArch className="w-full" />
        </div>
        <div className="relative mx-auto w-[min(104vw,620px)]">
          <div className="ambient" style={{ animation: 'bob 11s ease-in-out infinite' }}>
            <HeroIsland className="w-full drop-shadow-[0_28px_34px_rgba(10,35,45,.5)]" />
          </div>
        </div>
      </motion.div>

      {/* near */}
      <motion.div style={px(near)} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CloudLayer count={3} seed={12} depth={0.9} top={[78, 96]} />
        <Butterfly className="ambient absolute left-0 top-[58%] w-9" style={{ animation: 'flyAcross 26s linear infinite' }} />
        <Butterfly className="ambient absolute left-0 top-[66%] w-7" a="#F0B94B" b="#347D76" style={{ animation: 'flyBack 32s linear -12s infinite' }} />
        <Balloon className="ambient absolute right-[6%] top-[22%] w-14 sm:w-20" colors={['#8974BD', '#F1E8D6']} style={{ animation: 'bob 10s ease-in-out infinite' }} />
        <Balloon className="ambient absolute left-[6%] top-[28%] w-11 sm:w-16" colors={['#F0B94B', '#347D76']} style={{ animation: 'bob 12s ease-in-out -4s infinite' }} />
      </motion.div>
      <Motes count={16} seed={8} />
      <Mist className="absolute inset-x-0 bottom-0 h-[16%] w-full" />
      <Meadow className="pointer-events-none absolute inset-x-0 bottom-0 h-[9%] w-full" />

      {/* copy sits on the calm upper sky */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-[12svh] text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="kicker !text-ivory/95 [text-shadow:0_2px_12px_rgba(10,35,45,.6)]">
          {EVENT.title}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-[11.5vw] font-semibold uppercase leading-[1.02] tracking-[0.03em] text-ivory [text-shadow:0_3px_26px_rgba(10,35,45,.6)] sm:text-7xl"
        >
          A Little Wonder
          <br />
          <span className="text-sun">Is On The Way!</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} className="mt-4 font-display text-xl italic text-ivory [text-shadow:0_2px_14px_rgba(10,35,45,.7)] sm:text-3xl">
          {EVENT.subtitle}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-5 font-sans text-sm font-medium uppercase tracking-[0.35em] text-ivory [text-shadow:0_2px_12px_rgba(10,35,45,.7)]">
          {EVENT.parents} · {EVENT.dateLabel}
        </motion.p>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('story')}
        aria-label="Scroll to our story"
        className="absolute bottom-[3%] left-1/2 z-20 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-ivory/60 bg-ocean/50 text-ivory backdrop-blur"
      >
        <ChevronDown size={22} className="ambient" style={{ animation: 'bob 2.4s ease-in-out infinite' }} />
      </button>
    </section>
  );
}
